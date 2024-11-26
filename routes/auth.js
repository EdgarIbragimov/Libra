import express from "express";
// import bcrypt from "bcrypt";
import passport from "passport";
import { generateToken } from "../config/passport.js";

const authRouter = express.Router();

authRouter.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    const token = generateToken(req.user);

    //res.json({ token, message: "Successfull token generated" });
    //console.log(token);

    res.cookie("token", token, { httpOnly: true });
    res.redirect("/books");
  }
);

authRouter.get("/logout", (req, res) => {
  res.clearCookie("token"); // Clear the token cookie
  // req.logout(); // Log out the user
  res.redirect("/login"); // Redirect to the login page
});

export default authRouter;