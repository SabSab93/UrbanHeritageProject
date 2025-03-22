// tokenRouter.post("/", async (req, res) => {
//   try {
//     const { valeur_token, expiration } = req.body.data;

//     // Créer un nouveau token dans la base de données
//     const newToken = await prisma.token.create({
//       data: {
//         valeur_token: valeur_token,
//         expiration: new Date(expiration), // Assurez-vous que 'expiration' est au format Date
//       },
//     });

//     res.status(201).json(newToken); // Retourne le token créé
//   } catch (error) {
//     console.error("Prisma error:", error.message);
//     res.status(500).json({ error: "Server error", details: error.message });
//   }
// });


// // POST
// tokenRouter.post('/', monMiddlewareBearer, async (req, res) => {
//   const token = await prisma.token.create({
//     data : {
//       valeur_token : req.body.data.valeur_token,
//       expiration : req.body.data.expiration
//     }
//   });
//   res.status(201).json(token);
// })

