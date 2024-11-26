import passport from "passport";
import { readUsersData } from "../data/datamanager.js";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

passport.use(
  new LocalStrategy((username, password, done) => {
    const user = findUsersByName(username);
    if (!user) {
      return done(null, false, { message: "Wrong Username" });
    }

    if (!bcrypt.compareSync(password, user.passwordHash)) {
      console.log("hash: ",password);
      console.log("hash: ",user.passwordHash);

      return done(null, false, { message: "Wrong password" });
    }

    return done(null, user);
  })
);

export const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, 'your-secret-key', { expiresIn: '1h' });
};

export const verifyToken = (token) => {
  try {
      return jwt.verify(token, 'your-secret-key');
  } catch (error) {
      return null;
  }
};

function findUsersByName(username) {
  const userData = readUsersData();
  return userData.find((user) => user.username === username);
}

export default passport;