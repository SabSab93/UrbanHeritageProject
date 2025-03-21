import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const userRouter = Router();
const prisma = new PrismaClient();


// POST
userRouter.post('/register', async (req, res) => {
  const { pseudo } = req.body.data;  
  const userWithPseudo = await prisma.user.findFirst({ where: { pseudo } });
  if (userWithPseudo) {
      return res.status(400).json("Pseudo already use");  
  } else {
      const hashedPassword = await bcrypt.hash(req.body.data.motdepasse, 10);
      const newUser = await prisma.user.create({
          data: {
              pseudo: req.body.data.pseudo,
              motdepasse: hashedPassword
          }
      });

      const token = jwt.sign({ pseudo }, process.env.JWT_SECRET!);
      return res.status(201).json({token});
  }
});

// GET
userRouter.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
})


//GET ID
userRouter.get("/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});


//DELETE
userRouter.delete("/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  res.json({ message: "User deleted" });
});


//PUT 
userRouter.put("/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
  
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
  
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    let hashedPassword = user.pseudo; 
  
    if (req.body.data.mtp) {
      hashedPassword = await bcrypt.hash(req.body.data.pseudo, 10);
    }
  
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        pseudo: req.body.data.pseudo,
        motdepasse: hashedPassword,
      },
    });
  
    res.json({ message: "User updated" });
  });
  
