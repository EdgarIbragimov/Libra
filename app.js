import express from "express";
import { router } from "./routes.js";

const app = express();

app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static("public"));

app.use("/", router);
app.set("port", "3000");
app.listen("3000", () => {
  console.log("Server is running on http://localhost:3000");
});
