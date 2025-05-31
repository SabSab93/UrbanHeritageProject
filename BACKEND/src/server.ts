
import dotenv from "dotenv";

if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.prod" });
} else {
  dotenv.config();
}

import { app } from "./index";

const port = Number(process.env.PORT) || 1993;

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

process.once("SIGINT",  () => server.close(() => process.exit(0)));
process.once("SIGTERM", () => server.close(() => process.exit(0)));

