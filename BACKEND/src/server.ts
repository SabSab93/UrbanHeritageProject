import { app } from ".";

const port = Number(process.env.PORT) || 1992;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

process.once("SIGTERM", () => {
  server.close(() => {
    console.log("HTTP server closed");
  });
});
