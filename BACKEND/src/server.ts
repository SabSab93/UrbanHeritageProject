// Charge les variables d'environnement
import dotenv from "dotenv";

// Si on est en production, charge .env.prod, sinon .env par défaut
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.prod" });
} else {
  dotenv.config();
}

// Ensuite seulement, on importe les modules qui utilisent process.env
import { app } from "./index";

// Choix du port (ENVS)
const port = Number(process.env.PORT) || 1993;

// Démarrage du serveur
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log("🎯 Connected to DB:", process.env.DATABASE_URL);
});

// Arrêt propre
process.once("SIGINT",  () => server.close(() => process.exit(0)));
process.once("SIGTERM", () => server.close(() => process.exit(0)));
