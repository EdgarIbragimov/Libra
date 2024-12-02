import express from "express";
import booksRouter from "./routes/book.js";
import bodyParser from "body-parser";
import authRouter from "./routes/auth.js";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static("public"));
app.set("view engine", "pug");

app.use("/", booksRouter);
app.use("/auth", authRouter);

app.listen("3000", () => {
  console.log("Server is running on http://localhost:3000");
});
