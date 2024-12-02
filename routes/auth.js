import express from "express";
import passport from "passport";
import { generateToken } from "../config/passport.js";

const authRouter = express.Router();

authRouter.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error) {
      return next(error);
    }
    if (!user) {
      res.redirect("/login");
    }
    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/books");
  })(req, res, next);
});

authRouter.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

export default authRouter;
