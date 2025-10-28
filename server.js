// server.js
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

require('dotenv').config();

const PORT = process.env.PORT || 8080;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'links.json');
const SESSION_SECRET = process.env.SESSION_SECRET || 'change_me';
const LOGIN_USER = process.env.LOGIN_USER || 'admin';
const LOGIN_PASS = process.env.LOGIN_PASS || 'matrix2025';
const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || (24*60*60*1000), 10); // 24h

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ sites: [] }, null, 2));

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'public', 'static')));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: SESSION_MAX_AGE }
}));

// helper
function isAuthenticated(req) {
  return req.session && req.session.authenticated;
}

// serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// login endpoint
app.post('/login', (req, res) => {
  const { user, pass, remember } = req.body;
  if (user === LOGIN_USER && pass === LOGIN_PASS) {
    req.session.authenticated = true;
    req.session.user = user;
    if (remember) {
      req.session.cookie.maxAge = SESSION_MAX_AGE;
    }
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, error: 'Invalid credentials' });
});

// logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// API: get links (public only if logged)
app.get('/api/links', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'read error' });
    try { res.json(JSON.parse(data)); } catch(e) { res.status(500).json({ error: 'parse error' }); }
  });
});

// API: admin update (requires auth)
app.post('/api/links', (req, res) => {
  if (!isAuthenticated(req)) return res.status(403).json({ error: 'forbidden' });
  const body = req.body;
  fs.writeFile(DATA_FILE, JSON.stringify(body, null, 2), (err) => {
    if (err) return res.status(500).json({ error: 'write error' });
    res.json({ ok: true });
  });
});

// serve main app (if authenticated)
app.get('/', (req, res) => {
  if (!isAuthenticated(req)) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// admin UI (protected)
app.get('/admin', (req, res) => {
  if (!isAuthenticated(req)) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// static fallback
app.get('*', (req, res) => {
  if (!isAuthenticated(req)) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Matrix-home server listening on ${PORT}`));
