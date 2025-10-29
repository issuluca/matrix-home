import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { checkAuth } from "./auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8070;
const DATA_FILE = path.join(__dirname, "../data/links.json");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

function loadLinks() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function saveLinks(links) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2));
}

app.get("/api/links", (req, res) => {
  res.json(loadLinks());
});

app.post("/api/links", checkAuth, (req, res) => {
  const links = req.body;
  saveLinks(links);
  res.json({ message: "Dati salvati con successo" });
});

app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;
  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    res.json({ success: true, token: process.env.ADMIN_TOKEN });
  } else {
    res.status(401).json({ success: false, message: "Credenziali errate" });
  }
});

app.listen(PORT, () => console.log(`✅ Matrix-Home in ascolto su porta ${PORT}`));
