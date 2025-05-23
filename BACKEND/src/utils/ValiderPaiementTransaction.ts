// src/utils/ValiderPaiementTransaction.ts
import { PrismaClient } from '@prisma/client';
import { generateFacturePDF } from './generateFacturePDF';
import { sendMail, sendMailWithAttachment } from './mailService';
import { templateConfirmationCommande } from '../templateMails/commande/commandeConfirmation';
import { templateFactureEnvoyee } from '../templateMails/commande/envoiFacture';

const prisma = new PrismaClient();

/** Valide définitivement une commande déjà payée (webhook Stripe) */
export const validerPaiementTransaction = async (id_commande: number) => {
  return prisma.$transaction(
    async tx => {
      /* ------------------------------------------------------------------ *
       * 1. Récupération de la commande & contrôle d’existence               *
       * ------------------------------------------------------------------ */
      const commande = await tx.commande.findUnique({
        where: { id_commande },
        include: { LigneCommande: true },
      });
      if (!commande) throw new Error('Commande introuvable');

      /* ------------------------------------------------------------------ *
       * 2. Décrément du stock ligne par ligne                               *
       * ------------------------------------------------------------------ */
      for (const ligne of commande.LigneCommande) {
        const stock = await tx.stock.findFirst({
          where: {
            id_maillot:     ligne.id_maillot,
            taille_maillot: ligne.taille_maillot,
          },
        });
        if (!stock) throw new Error(`Stock introuvable (maillot ${ligne.id_maillot})`);

        // dispo = entrées – sorties
        const mouvements = await tx.stockMaillot.findMany({
          where: { id_stock: stock.id_stock },
          select: { type_mouvement: true, quantite_stock: true },
        });
        const dispo = mouvements.reduce(
          (acc, m) => acc + (m.type_mouvement === 'entree' ? m.quantite_stock : -m.quantite_stock),
          0,
        );
        if (ligne.quantite > dispo)
          throw new Error(`Stock insuffisant (maillot ${ligne.id_maillot})`);

        // écriture de la sortie
        await tx.stockMaillot.create({
          data: {
            id_stock: stock.id_stock,
            type_mouvement: 'sortie',
            quantite_stock: ligne.quantite,
          },
        });

        // compteur « quantité vendue » sur la table Maillot
        await tx.maillot.update({
          where: { id_maillot: ligne.id_maillot },
          data: { quantite_vendue: { increment: ligne.quantite } },
        });
      }

      /* ------------------------------------------------------------------ *
       * 3. Passage de la commande en « payée » et « en cours de préparation »
       * ------------------------------------------------------------------ */
      await tx.commande.update({
        where: { id_commande },
        data: { statut_commande: 'en_cours_de_preparation', statut_paiement: 'paye' },
      });

      /* ------------------------------------------------------------------ *
       * 4. Rechargement « full » de la commande pour la facture et le mail  *
       * ------------------------------------------------------------------ */
      const cmd = await tx.commande.findUnique({
        where: { id_commande },
        include: {
          Client:           true,
          LigneCommande:    { include: { Maillot: true, Personnalisation: true } },
          Livraison:        { include: { MethodeLivraison: true, LieuLivraison: true, Livreur: true } },
          CommandeReduction:{ include: { Reduction: true } },
        },
      });
      if (!cmd) throw new Error('Impossible de charger la commande complète');

      /* ------------------------------------------------------------------ *
       * 5. Création de la facture (enregistre + génère le PDF)              *
       * ------------------------------------------------------------------ */
      const dateFacture   = new Date();
      const numeroFacture = `FCT-${id_commande}-${Date.now()}`;

      await tx.facture.create({
        data: {
          numero_facture: numeroFacture,
          id_commande,
          facture_hors_ue: cmd.Client.pays_client.toLowerCase() === 'suisse',
          date_facture: dateFacture,
        },
      });

      /* 5.a Détail des articles pour le PDF ------------------------------ */
      const articles = cmd.LigneCommande.map(l => {
        const prixBase   = Number(l.prix_ht);
        const prixPerso  = l.Personnalisation ? Number(l.Personnalisation.prix_ht) : 0;
        const unitHT     = prixBase + prixPerso;
        const montantHT  = unitHT * l.quantite;

        return {
          description: l.Maillot.nom_maillot,
          quantite:    l.quantite,
          prixDeBase:  prixBase,
          totalPersonnalisations: prixPerso,
          prixUnitaireHT: unitHT,
          montantHT,
          personnalisations: l.Personnalisation
            ? [{
                description: l.Personnalisation.type_personnalisation,
                prix:        prixPerso,
                valeur:      l.valeur_personnalisation,
                couleur:     l.couleur_personnalisation,
              }]
            : [],
        };
      });

      /* 5.b Totaux ------------------------------------------------------- */
      const liv = cmd.Livraison[0];
      const fraisLivraison = (liv?.MethodeLivraison.prix_methode || 0) +
                             (liv?.LieuLivraison.prix_lieu || 0);

      const totalArticlesHT = articles.reduce((s, a) => s + a.montantHT, 0);
      const valeurReduction = cmd.CommandeReduction
        ? Number(cmd.CommandeReduction.Reduction.valeur_reduction)
        : 0;

      const totalHTBrut   = totalArticlesHT + fraisLivraison;
      const totalHT       = totalHTBrut - valeurReduction;
      const tvaTx         = cmd.Client.pays_client.toLowerCase() === 'suisse' ? 0 : 20;
      const totalTTC      = totalHT * (1 + tvaTx / 100);

      /* 5.c PDF ---------------------------------------------------------- */
      const pdfPath = await generateFacturePDF({
        numeroFacture: numeroFacture,
        dateFacture:   dateFacture.toLocaleDateString('fr-FR'),
        client: {
          nom:     cmd.Client.nom_client,
          adresse: cmd.Client.adresse_client,
          email:   cmd.Client.adresse_mail_client,
        },
        articles,
        totalHTBrut,
        reductionCommande: valeurReduction,
        totalHT,
        tva: tvaTx,
        totalTTC,
        livraison: {
          methode: liv?.MethodeLivraison.nom_methode,
          lieu:    liv?.LieuLivraison.nom_lieu,
          livreur: liv?.Livreur.nom_livreur,
          prix:    fraisLivraison,
        },
      });

      /* ------------------------------------------------------------------ *
       * 6. Mails de confirmation & facture                                 *
       * ------------------------------------------------------------------ */
      await sendMail({
        to:      cmd.Client.adresse_mail_client,
        subject: '🎉 Confirmation de votre commande UrbanHeritage',
        html:    templateConfirmationCommande(
                   cmd.Client.prenom_client || cmd.Client.nom_client,
                   String(cmd.id_commande),
                 ),
      });

      await sendMailWithAttachment({
        to:             cmd.Client.adresse_mail_client,
        subject:        '🧾 Votre facture UrbanHeritage',
        html:           templateFactureEnvoyee(
                           cmd.Client.prenom_client || cmd.Client.nom_client,
                         ),
        attachmentPath: pdfPath,
      });

      return {
        message: 'Paiement validé, stock décrémenté, facture générée, mails envoyés.',
      };
    },
    { timeout: 15_000 },
  );
};
