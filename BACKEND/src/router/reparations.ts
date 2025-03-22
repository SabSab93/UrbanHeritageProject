// import { Router } from "express";
// import { PrismaClient } from "@prisma/client";

// export const reparationRouter = Router();
// const prisma = new PrismaClient();

// // POST
// reparationRouter.post('/', async (req, res) => {
//   const reparation = await prisma.reparation.create({
//     data : {
//       name:req.body.data.name,
//       prix: req.body.data.prix,
//       instrumentId: req.body.data.instrumentId
//     }
//   });
//   res.status(201).json(reparation);
// })


// //DELETE
// reparationRouter.delete("/:id", async (req, res) => {
//     const reparationId = parseInt(req.params.id);
  
//     if (isNaN(reparationId)) {
//       return res.status(400).json({ message: "Invalid Reparation ID" });
//     }
  
//     const reparation = await prisma.reparation.findUnique({
//       where: { id: reparationId },
//     });
  
//     if (!reparation) {
//       return res.status(404).json({ message: "Reparation not found" });
//     }
  
//     await prisma.reparation.delete({
//       where: { id: reparationId },
//     });
  
//     res.json({ message: "Reparation deleted" });
//   });
  

