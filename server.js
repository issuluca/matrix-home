import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8070;
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "password";
const LINKS_FILE = process.env.LINKS_FILE || "./data/links.json";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "matrix_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

function isAuthenticated(req, res, next) {
  if (req.session.loggedIn) return next();
  res.redirect("/login.html");
}

// --- Login ---
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.loggedIn = true;
    res.redirect("/admin.html");
  } else {
    res.send("<h2>Accesso negato</h2><a href='/login.html'>Torna indietro</a>");
  }
});

// --- Logout ---
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

// --- API: lista link ---
app.get("/api/links", (req, res) => {
  const data = JSON.parse(fs.readFileSync(LINKS_FILE));
  res.json(data);
});

// --- API: aggiungi link (solo autenticato) ---
app.post("/api/links", isAuthenticated, (req, res) => {
  const newLink = req.body;
  const data = JSON.parse(fs.readFileSync(LINKS_FILE));
  data.push(newLink);
  fs.writeFileSync(LINKS_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// --- Avvio server ---
app.listen(PORT, () => {
  console.log(`Matrix Home in esecuzione su http://localhost:${PORT}`);
});
