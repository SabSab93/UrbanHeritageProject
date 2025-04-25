
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
export const factureRouter = Router();
const prisma = new PrismaClient();
// ✅ POST - Générer une facture pour une commande payée
factureRouter.post("/create/:id_commande", async (req, res) => {
  const id_commande = parseInt(req.params.id_commande);
  const data = req.body.data;
  if (isNaN(id_commande)) {
    return res.status(400).json({ message: "ID de commande invalide" });
  }
  try {
    const commande = await prisma.commande.findUnique({
      where: { id_commande },
      include: { Client: true },
    });
    if (!commande) return res.status(404).json({ message: "Commande introuvable" });
    if (commande.statut_paiement !== "paye") {
      return res.status(400).json({ message: "La commande n'est pas encore payée" });
    }
    const existingFacture = await prisma.facture.findFirst({
      where: { id_commande },
    });
    if (existingFacture) {
      return res.status(400).json({ message: "Une facture existe déjà pour cette commande" });
    }
    const numero_facture = `FCT-${id_commande}-${Date.now()}`;
    const paysClient = commande.Client.pays_client?.toLowerCase() || "";
    const horsUE = paysClient === "suisse";
    const newFacture = await prisma.facture.create({
      data: {
        numero_facture,
        id_commande,
        facture_hors_ue: horsUE,
        date_facture: data?.date_facture ? new Date(data.date_facture) : undefined,
      },
    });
    res.status(201).json({
      message: "Facture générée avec succès",
      facture: newFacture,
    });
  } catch (error: any) {
    console.error("Erreur création facture :", error);
    res.status(500).json({
      message: "Erreur serveur lors de la génération de la facture",
      erreur: error.message,
    });
  }
});
// ✅ GET - toutes les factures
factureRouter.get("/", async (req, res) => {
  try {
    const factures = await prisma.facture.findMany({
      orderBy: { date_facture: "desc" },
    });
    res.json(factures);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur", erreur: error.message });
  }
});
// ✅ GET - facture par numéro
factureRouter.get("/:numero_facture", async (req, res) => {
  const numero_facture = req.params.numero_facture;
  try {
    const facture = await prisma.facture.findUnique({
      where: { numero_facture },
    });
    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }
    res.json(facture);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur serveur", erreur: error.message });
  }
});
