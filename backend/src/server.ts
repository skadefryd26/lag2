import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import { labyrintRouter } from "./features/labyrint/routes/labyrintRoutes.ts";
import { stegRouter } from "./features/labyrint/routes/stegRoutes.ts";
import { lokaleRouter } from "./features/labyrint/routes/lokaleRoutes.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
// Tokenet ligger i .env.local i prosjektroten (aldri i Git).
dotenv.config({ path: path.resolve(here, "../../.env.local") });

const app = express();
app.use(express.json());
app.use("/api", labyrintRouter);
app.use("/api", stegRouter);
app.use("/api", lokaleRouter);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`Bjarne-backend kjører på http://localhost:${port}`);
});
