import { verifyToken } from "../config/passport.js";

export const authenticateToken = (req, res, next) => {
  const cookieToken = req.cookies.token;

  if (!cookieToken) {
    res.redirect("/login");
  }

  const user = verifyToken(cookieToken);
  if (!user) {
    return res.status(403).json({ message: "Неверный токен" });
  }

  req.user = user;
  next();
};
