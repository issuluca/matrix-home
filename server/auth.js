export function checkAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (token === process.env.ADMIN_TOKEN) {
    next();
  } else {
    res.status(403).json({ message: "Accesso non autorizzato" });
  }
}
