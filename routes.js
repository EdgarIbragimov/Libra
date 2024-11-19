import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
export const router = express.Router();

router.use(bodyParser.json());
router.use(express.json());

let data = fs.readFileSync("./public/json/database.json", "utf-8");
let booksJSON = JSON.parse(data);

router.get("/", (req, res) => {
  // домашняя страница
  res.render("login");
});

router.get("/main", (req, res) => {
  res.render("main");
});

// Обработчик POST для маршрута /main
router.post("/main", (req, res) => {
  // Здесь можно добавить логику для обработки данных формы
  // Например, проверка логина и пароля
  res.redirect("/main"); // Перенаправление на страницу main
});

router.get("*", (req, res) => {
  res.status(404);
  res.end("Page not found");
});
