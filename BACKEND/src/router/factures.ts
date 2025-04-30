import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { generateFacturePDF } from "../utils/generateFacturePDF";
import { monMiddlewareBearer } from "../../middleware/checkToken";
import { isAdmin } from "../../middleware/isAdmin";

export const factureRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
const parseId = (raw: any, label = "ID") => {
  const parsed = parseInt(raw as string, 10);
  if (Number.isNaN(parsed) || parsed <= 0) throw new Error(`${label} invalide`);
  return parsed;
};

/** Construit l'objet attendu par generateFacturePDF. */
const buildPdfData = (
  order: any,
  invoiceNumber: string,
  dateFacture: Date,
  horsUe: boolean
) => {
  // Total HT sans personnalisations (pour totalHTBrut)
  const totalHTBrut = order.LigneCommande.reduce(
    (sum: number, lc: any) => sum + lc.prix_ht.toNumber() * lc.quantite,
    0
  );

  // Total HT avec personnalisations (totalHT)
  const totalHT = order.LigneCommande.reduce((sum: number, lc: any) => {
    const base = lc.prix_ht.toNumber() * lc.quantite;
    const pers = lc.LigneCommandePersonnalisation.reduce(
      (acc: number, p: any) => acc + p.prix_personnalisation_ht.toNumber(),
      0
    );
    return sum + base + pers;
  }, 0);

  return {
    numeroFacture: invoiceNumber,
    dateFacture: dateFacture.toLocaleDateString("fr-FR"),
    client: {
      nom: order.Client.nom_client,
      adresse: order.Client.adresse_client,
      email: order.Client.adresse_mail_client,
    },
    articles: order.LigneCommande.map((lc: any) => ({
      description: lc.Maillot.nom_maillot,
      quantite: lc.quantite,
      prixUnitaireHT: lc.prix_ht.toNumber(),
      montantHT: lc.quantite * lc.prix_ht.toNumber(),
      personnalisations: lc.LigneCommandePersonnalisation.map((p: any) => ({
        description: p.Personnalisation.description,
        prix: p.prix_personnalisation_ht.toNumber(),
      })),
    })),
    totalHTBrut,
    totalHT,
    tva: horsUe ? 0 : 20,
    totalTTC: order.montant_total_ttc?.toNumber() || 0,
    livraison: {
      methode: order.Livraison[0]?.MethodeLivraison.nom_methode,
      lieu: order.Livraison[0]?.LieuLivraison.nom_lieu,
      livreur: order.Livraison[0]?.Livreur.nom_livreur,
      prix:
        (order.Livraison[0]?.MethodeLivraison.prix_methode || 0) +
        (order.Livraison[0]?.LieuLivraison.prix_lieu || 0),
    },
  };
};

/*** Création + PDF ***********************************************************/
factureRouter.post("/create/:id_commande",monMiddlewareBearer, async (req: Request, res: Response) => {
  try {
    const idCommande = parseId(req.params.id_commande, "id_commande");
    const dateFacture = req.body.date_facture ? new Date(req.body.date_facture) : new Date();

    const order = await prisma.commande.findUnique({
      where: { id_commande: idCommande },
      include: {
        Client: true,
        LigneCommande: {
          include: {
            Maillot: true,
            LigneCommandePersonnalisation: { include: { Personnalisation: true } },
          },
        },
        Livraison: { include: { MethodeLivraison: true, LieuLivraison: true, Livreur: true } },
      },
    });
    if (!order) return res.status(404).json({ message: "Commande introuvable" });
    if (order.statut_paiement !== "paye")
      return res.status(400).json({ message: "Commande non payée" });

    if (await prisma.facture.findFirst({ where: { id_commande: idCommande } }))
      return res.status(400).json({ message: "Facture déjà existante" });

    const invoiceNumber = `FCT-${idCommande}-${Date.now()}`;
    const horsUe = order.Client.pays_client.toLowerCase() === "suisse";

    const facture = await prisma.facture.create({
      data: {
        numero_facture: invoiceNumber,
        id_commande: idCommande,
        facture_hors_ue: horsUe,
        date_facture: dateFacture,
      },
    });

    const pdfPath = await generateFacturePDF(
      buildPdfData(order, invoiceNumber, dateFacture, horsUe)
    );

    res.status(201).json({ message: "Facture créée", facture, pdfPath });
  } catch (error: any) {
    const status = error.message?.includes("invalide") ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** Lecture **************************************************************/

// Liste des factures du **client connecté** (auth requise)
factureRouter.get("/", monMiddlewareBearer, async (req: any, res) => {
  try {
    const clientId = req.decoded.id_client;
    const invoices = await prisma.facture.findMany({
      where: { Commande: { id_client: clientId } },
      orderBy: { date_facture: "desc" },
    });
    res.json(invoices);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Liste **complète** (admin only)
factureRouter.get("/all", monMiddlewareBearer, isAdmin, async (_req, res) => {
  try {
    const invoices = await prisma.facture.findMany({ orderBy: { date_facture: "desc" } });
    res.json(invoices);
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});
/*** Téléchargement PDF *******************************************************/
factureRouter.get("/download/:numero_facture",monMiddlewareBearer, async (req, res) => {
  const num = req.params.numero_facture;
  const filePath = path.join(__dirname, `../../factures/facture_${num}.pdf`);
  res.download(filePath, (err) => {
    if (err) res.status(404).json({ message: "PDF introuvable", erreur: err.message });
  });
});

/*** Régénération PDF (admin only)********************************************/
factureRouter.get("/regenerate-pdf/:numero_facture",monMiddlewareBearer, isAdmin, async (req, res) => {
  try {
    const num = req.params.numero_facture;
    const invoice = await prisma.facture.findUnique({ where: { numero_facture: num } });
    if (!invoice) return res.status(404).json({ message: "Facture introuvable" });

    const order = await prisma.commande.findUnique({
      where: { id_commande: invoice.id_commande },
      include: {
        Client: true,
        LigneCommande: {
          include: {
            Maillot: true,
            LigneCommandePersonnalisation: { include: { Personnalisation: true } },
          },
        },
        Livraison: { include: { MethodeLivraison: true, LieuLivraison: true, Livreur: true } },
      },
    });
    if (!order) return res.status(404).json({ message: "Commande introuvable" });

    const pdfPath = await generateFacturePDF(
      buildPdfData(order, invoice.numero_facture, invoice.date_facture || new Date(), !!invoice.facture_hors_ue)
    );
    res.json({ message: "PDF régénéré", path: pdfPath });
  } catch {
    res.status(500).json({ message: "Erreur serveur" });
  }
});
