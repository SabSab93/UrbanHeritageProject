import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export const roleRouter = Router();
const prisma = new PrismaClient();

// ✅ GET - tous les rôles
roleRouter.get("/", async (req, res) => {
  try {
    const roles = await prisma.role.findMany();
    res.json(roles);
  } catch (error) {
    console.error("Erreur récupération rôles :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ GET - rôle par ID
roleRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const role = await prisma.role.findUnique({
      where: { id_role: id },
    });

    if (!role) return res.status(404).json({ message: "Rôle non trouvé" });

    res.json(role);
  } catch (error) {
    console.error("Erreur récupération rôle :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ POST - création d’un rôle
roleRouter.post("/create", async (req, res) => {
  const data = req.body.data;

  try {
    const nouveauRole = await prisma.role.create({
      data: {
        nom_role: data.nom_role,
        description: data.description ?? "",
      },
    });

    res.status(201).json(nouveauRole);
  } catch (error) {
    console.error("Erreur création rôle :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ PUT - mise à jour d’un rôle
roleRouter.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body.data;

  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    const updatedRole = await prisma.role.update({
      where: { id_role: id },
      data: {
        nom_role: data.nom_role,
        description: data.description,
      },
    });

    res.json(updatedRole);
  } catch (error) {
    console.error("Erreur mise à jour rôle :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ DELETE - suppression
roleRouter.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  try {
    await prisma.role.delete({ where: { id_role: id } });
    res.json({ message: "Rôle supprimé" });
  } catch (error) {
    console.error("Erreur suppression rôle :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
