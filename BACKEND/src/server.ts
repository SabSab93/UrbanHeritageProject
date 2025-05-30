// server.ts

import { app } from "./index";   // ou "./server" si vous préférez renommer
import { config } from "dotenv";  // si vous voulez recharger ici

// Choix du port (ENVS)
const port = Number(process.env.PORT) || 1993;

// Démarrage du serveur
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Arrêt propre pour éviter les sockets orphelins
process.once("SIGINT",  () => server.close(() => process.exit(0)));
process.once("SIGTERM", () => server.close(() => process.exit(0)));