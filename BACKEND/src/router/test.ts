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



// **************** POST ****************
// tokenRouter.post('/', async (req, res) => {
//   try {
//     const token = await prisma.token.create({
//       data: {
//         valeur_token: req.body.data.valeur_token,
//         expiration: new Date(req.body.data.expiration),
//       },
//     });

//     // Convert the ID (or any other BigInt) to a string
//     const tokenResponse = {
//       ...token,
//       id_token: token.id_token.toString(), // Convert the BigInt ID to a string
//     };

//     res.status(201).json(tokenResponse);
//   } catch (error: unknown) {  // Specifying that 'error' is of type 'unknown'
//     if (error instanceof Error) {  // Type guard to check if it's an instance of Error
//       console.error(error.message);
//       res.status(500).json({ message: "Error creating the token", error: error.message });
//     } else {
//       res.status(500).json({ message: "Unknown error", error: "An unknown error occurred" });
//     }
//   }
// });

