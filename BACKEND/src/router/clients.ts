import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { monMiddlewareBearer } from "../../middleware/checkToken";
import { isAdmin } from "../../middleware/isAdmin";
import { anonymiseClient } from "../utils/anonymiseClient";

export const clientRouter = Router();
const prisma = new PrismaClient();

/*** Utils *******************************************************************/
const parseId = (raw: any): number => {
  const parsed = parseInt(raw as string, 10);
  if (Number.isNaN(parsed) || parsed <= 0) throw new Error("ID invalide");
  return parsed;
};

/*** 1. Lecture : liste & détail **********************************************/
// Tous les clients (admin only)
clientRouter.get("/", monMiddlewareBearer, isAdmin, async (_req, res) => {
  const clients = await prisma.client.findMany({ include: { Role: true } });
  res.json(clients);
});

// Client par ID (authentifié)
clientRouter.get("/:id", monMiddlewareBearer, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const client = await prisma.client.findUnique({
      where: { id_client: id },
      include: { Role: true },
    });
    if (!client) return res.status(404).json({ message: "Client non trouvé" });
    res.json(client);
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

// Détail complet d’un client (commandes, livraisons, etc.)
clientRouter.get("/:id/details", monMiddlewareBearer, async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const clientDetails = await prisma.client.findUnique({
      where: { id_client: id },
      include: {
        Commande: {
          include: {
            LigneCommande: {
              include: {
                Maillot: true,
                TVA: true,
                LigneCommandePersonnalisation: { include: { Personnalisation: true } },
              },
            },
            Livraison: { include: { MethodeLivraison: true, LieuLivraison: true, Livreur: true } },
          },
        },
        Role: true,
      },
    });
    if (!clientDetails)
      return res.status(404).json({ message: "Client non trouvé" });
    res.json(clientDetails);
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** 2. Mise à jour d’un client **********************************************/
clientRouter.put("/:id", monMiddlewareBearer, async (req: any, res) => {
  try {
    const id = parseId(req.params.id);
    const existingClient = await prisma.client.findUnique({ where: { id_client: id } });
    if (!existingClient)
      return res.status(404).json({ message: "Client non trouvé" });

    const updateData = req.body.data;
    let hashedPassword = existingClient.mot_de_passe;

    if (updateData.mot_de_passe)
      hashedPassword = await bcrypt.hash(updateData.mot_de_passe, 10);

    if (updateData.id_role && req.decoded?.id_role !== 1)
      return res.status(403).json({ message: "Seul un administrateur peut changer un rôle." });

    let parsedBirthDate: Date | undefined;
    if (updateData.date_naissance_client) {
      const [jour, mois, annee] = updateData.date_naissance_client.split("/");
      const birth = new Date(`${annee}-${mois}-${jour}`);
      if (Number.isNaN(birth.getTime()))
        return res.status(400).json({ message: "Format de date invalide. JJ/MM/AAAA" });
      parsedBirthDate = birth;
    }

    const updatedClient = await prisma.client.update({
      where: { id_client: id },
      data: {
        nom_client: updateData.nom_client ?? undefined,
        prenom_client: updateData.prenom_client ?? undefined,
        civilite: updateData.civilite ?? undefined,
        date_naissance_client: parsedBirthDate ?? undefined,
        adresse_client: updateData.adresse_client ?? undefined,
        code_postal_client: updateData.code_postal_client ?? undefined,
        ville_client: updateData.ville_client ?? undefined,
        pays_client: updateData.pays_client ?? undefined,
        mot_de_passe: hashedPassword,
        id_role: updateData.id_role ?? undefined,
      },
    });

    res.json({ message: "Client mis à jour", client: updatedClient });
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});

/*** 3. Suppression (anonymisation RGPD) *************************************/
clientRouter.delete("/:id", monMiddlewareBearer, async (req: any, res) => {
  try {
    const id = parseId(req.params.id);

    // Seul le propriétaire du compte ou un admin peut anonymiser
    const isSelf = req.decoded?.id_client === id;
    const isAdminRole = req.decoded?.id_role === 1;
    if (!isSelf && !isAdminRole)
      return res.status(403).json({ message: "Accès interdit" });

    const anonymised = await anonymiseClient(id);
    res.json({ message: "Compte anonymisé conformément au RGPD ✅", client: anonymised });
  } catch (error: any) {
    const status = error.message === "ID invalide" ? 400 : 500;
    res.status(status).json({ message: error.message ?? "Erreur serveur" });
  }
});
