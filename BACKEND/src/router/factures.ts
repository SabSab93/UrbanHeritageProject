import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { generateFacturePDF } from "../utils/generateFacturePDF";
import path from "path";

const prisma = new PrismaClient();
export const factureRouter = Router();

// ✅ POST - Générer une facture avec PDF
factureRouter.post("/create/:id_commande", async (req, res) => {
  const id_commande = parseInt(req.params.id_commande);
  const dateFacture = req.body.date_facture ? new Date(req.body.date_facture) : new Date();

  if (isNaN(id_commande)) {
    return res.status(400).json({ message: "ID de commande invalide" });
  }

  try {
    const commande = await prisma.commande.findUnique({
      where: { id_commande },
      include: {
        Client: true,
        LigneCommande: {
          include: {
            Maillot: true,
            LigneCommandePersonnalisation: {
              include: { Personnalisation: true },
            },
          },
        },
        Livraison: {
          include: {
            MethodeLivraison: true,
            LieuLivraison: true,
            Livreur: true,
          },
        },
      },
    });

    if (!commande) return res.status(404).json({ message: "Commande introuvable." });
    if (commande.statut_paiement !== "paye") {
      return res.status(400).json({ message: "Commande non payée." });
    }

    const factureExistante = await prisma.facture.findFirst({ where: { id_commande } });
    if (factureExistante) {
      return res.status(400).json({ message: "Facture déjà existante pour cette commande." });
    }

    const numero_facture = `FCT-${id_commande}-${Date.now()}`;
    const paysClient = commande.Client.pays_client.toLowerCase();
    const facture_hors_ue = paysClient === "suisse";

    const facture = await prisma.facture.create({
      data: {
        numero_facture,
        id_commande,
        facture_hors_ue,
        date_facture: dateFacture,
      },
    });

    const facturePDFData = {
      numeroFacture: numero_facture,
      dateFacture: dateFacture.toLocaleDateString("fr-FR"),
      client: {
        nom: commande.Client.nom_client,
        adresse: commande.Client.adresse_client,
        email: commande.Client.adresse_mail_client,
      },
      articles: commande.LigneCommande.map((ligne) => ({
        description: ligne.Maillot.nom_maillot,
        quantite: ligne.quantite,
        prixUnitaireHT: ligne.prix_ht.toNumber(),
        montantHT: ligne.quantite * ligne.prix_ht.toNumber(),
        personnalisations: ligne.LigneCommandePersonnalisation.map((p) => ({
          description: p.Personnalisation.description,
          prix: p.prix_personnalisation_ht.toNumber(),
        })),
      })),
      totalHT: commande.LigneCommande.reduce((total, ligne) => {
        const base = ligne.prix_ht.toNumber() * ligne.quantite;
        const perso = ligne.LigneCommandePersonnalisation.reduce(
          (acc, p) => acc + p.prix_personnalisation_ht.toNumber(),
          0
        );
        return total + base + perso;
      }, 0),
      tva: facture_hors_ue ? 0 : 20,
      totalTTC: commande.montant_total_ttc?.toNumber() || 0,
      livraison: {
        methode: commande.Livraison[0]?.MethodeLivraison.nom_methode,
        lieu: commande.Livraison[0]?.LieuLivraison.nom_lieu,
        livreur: commande.Livraison[0]?.Livreur.nom_livreur,
        prix:
          (commande.Livraison[0]?.MethodeLivraison.prix_methode || 0) +
          (commande.Livraison[0]?.LieuLivraison.prix_lieu || 0),
      },
    };

    const pdfPath = await generateFacturePDF(facturePDFData);
    res.status(201).json({ message: "Facture créée avec succès.", facture, pdfPath });
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur lors de la création de la facture.", erreur: error.message });
  }
});

// ✅ GET - Récupérer toutes les factures
factureRouter.get("/", async (req, res) => {
  try {
    const factures = await prisma.facture.findMany({
      orderBy: { date_facture: "desc" },
    });
    res.status(200).json(factures);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", erreur: error.message });
  }
});

// ✅ GET - Récupérer une facture par numéro
factureRouter.get("/:numero_facture", async (req, res) => {
  try {
    const facture = await prisma.facture.findUnique({
      where: { numero_facture: req.params.numero_facture },
    });

    if (!facture) {
      return res.status(404).json({ message: "Facture introuvable." });
    }

    res.status(200).json(facture);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur.", erreur: error.message });
  }
});

// ✅ GET - Télécharger le PDF d'une facture
factureRouter.get("/download/:numero_facture", async (req, res) => {
  const numero_facture = req.params.numero_facture;
  const pdfPath = path.join(__dirname, `../../factures/facture_${numero_facture}.pdf`);

  res.download(pdfPath, (err) => {
    if (err) {
      res.status(404).json({ message: "PDF introuvable.", erreur: err.message });
    }
  });
});

// ✅ GET - Régénérer un PDF existant
factureRouter.get('/regenerate-pdf/:numero_facture', async (req, res) => {
  const { numero_facture } = req.params;

  try {
    const facture = await prisma.facture.findUnique({
      where: { numero_facture },
    });

    if (!facture) {
      return res.status(404).json({ message: "Facture introuvable." });
    }

    const commande = await prisma.commande.findUnique({
      where: { id_commande: facture.id_commande },
      include: {
        Client: true,
        LigneCommande: {
          include: {
            Maillot: true,
            LigneCommandePersonnalisation: {
              include: { Personnalisation: true },
            },
          },
        },
        Livraison: {
          include: {
            MethodeLivraison: true,
            LieuLivraison: true,
            Livreur: true,
          },
        },
      },
    });

    if (!commande) {
      return res.status(404).json({ message: "Commande liée à la facture introuvable." });
    }

    const pdfData = {
      numeroFacture: facture.numero_facture,
      dateFacture: facture.date_facture?.toLocaleDateString("fr-FR") || "",
      client: {
        nom: commande.Client.nom_client,
        adresse: commande.Client.adresse_client,
        email: commande.Client.adresse_mail_client,
      },
      articles: commande.LigneCommande.map((ligne) => ({
        description: ligne.Maillot.nom_maillot,
        quantite: ligne.quantite,
        prixUnitaireHT: ligne.prix_ht.toNumber(),
        montantHT: ligne.quantite * ligne.prix_ht.toNumber(),
        personnalisations: ligne.LigneCommandePersonnalisation.map((p) => ({
          description: p.Personnalisation.description,
          prix: p.prix_personnalisation_ht.toNumber(),
        })),
      })),
      totalHT: commande.LigneCommande.reduce((total, ligne) => {
        const base = ligne.prix_ht.toNumber() * ligne.quantite;
        const perso = ligne.LigneCommandePersonnalisation.reduce(
          (acc, p) => acc + p.prix_personnalisation_ht.toNumber(),
          0
        );
        return total + base + perso;
      }, 0),
      tva: facture.facture_hors_ue ? 0 : 20,
      totalTTC: commande.montant_total_ttc?.toNumber() || 0,
      livraison: {
        methode: commande.Livraison[0]?.MethodeLivraison.nom_methode,
        lieu: commande.Livraison[0]?.LieuLivraison.nom_lieu,
        livreur: commande.Livraison[0]?.Livreur.nom_livreur,
        prix:
          (commande.Livraison[0]?.MethodeLivraison.prix_methode || 0) +
          (commande.Livraison[0]?.LieuLivraison.prix_lieu || 0),
      },
    };

    const pathPDF = await generateFacturePDF(pdfData);
    res.status(200).json({ message: "PDF régénéré avec succès", path: pathPDF });
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur", erreur: error.message });
  }
});
