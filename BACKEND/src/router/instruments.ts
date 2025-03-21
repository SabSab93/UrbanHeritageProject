import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { monMiddlewareBearer } from "../checkToken";

export const instrumentRouter = Router();
const prisma = new PrismaClient();


// POST
instrumentRouter.post('/', monMiddlewareBearer, async (req, res) => {
  const instrument = await prisma.instrument.create({
    data : {
      name:req.body.data.name,
      poids:req.body.data.poids,
      couleur:req.body.data.couleur,
      prix:req.body.data.prix
    }
  });
  res.status(201).json(instrument);
})


// GET
instrumentRouter.get("/", async (req, res) => {
  const instruments = await prisma.instrument.findMany();
  res.json(instruments);
})


//GET ID
instrumentRouter.get("/:id", async (req, res) => {
  const instrumentId = parseInt(req.params.id);

  if (isNaN(instrumentId)) {
    return res.status(400).json({ message: "Invalid Instrument ID" });
  }

  const instrument = await prisma.instrument.findUnique({
    where: { id: instrumentId },
  });

  if (!instrument) {
    return res.status(404).json({ message: "Instrument not found" });
  }

  res.json(instrument);
});


//DELETE
instrumentRouter.delete("/:id", async (req, res) => {
  const instrumentId = parseInt(req.params.id);

  if (isNaN(instrumentId)) {
    return res.status(400).json({ message: "Invalid Instrument ID" });
  }

  const instrument = await prisma.instrument.findUnique({
    where: { id: instrumentId },
  });

  if (!instrument) {
    return res.status(404).json({ message: "Instrument not found" });
  }

  await prisma.instrument.delete({
    where: { id: instrumentId },
  });

  res.json({ message: "Instrument deleted" });
});


//PUT 
instrumentRouter.put("/:id", async (req, res) => {
  const instrumentId = parseInt(req.params.id);

  if (isNaN(instrumentId)) {
    return res.status(400).json({ message: "Invalid Instrument ID" });
  }

  const instrument = await prisma.instrument.findUnique({
    where: { id: instrumentId },
  });

  if (!instrument) {
    return res.status(404).json({ message: "Instrument not found" });
  }

  const updateinstrumentId = await prisma.instrument.update({
    where: { id: instrumentId },
    data: {
      name:req.body.data.name,
      poids:req.body.data.poids,
      couleur:req.body.data.couleur,
      prix:req.body.data.prix
    },
  });

  res.json(updateinstrumentId);
});