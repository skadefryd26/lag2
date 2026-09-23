import express from "express";
import { questRouter } from "./quest.js";

const PORT = 3001;

express()
  .use(express.json({ limit: "64kb" }))
  .use(questRouter)
  .listen(PORT, () => console.log(`Backend: http://localhost:${PORT}`));
