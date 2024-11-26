import { verifyToken } from "../config/passport.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];
    //new
  const cookieToken = req.cookies.token;
  // const validToken = token || cookieToken;
  const validToken = cookieToken;

  if (!validToken) {
    return res.status(401).json({ message: "Токен отсутствует" });
  }

  const user = verifyToken(validToken);
  if (!user) {
    return res.status(403).json({ message: "Неверный токен" });
  }

  req.user = user;
  next();
};
