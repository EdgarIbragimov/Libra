import express from "express";
import {
  readBooksData,
  readUsersData,
  writeBooksData,
} from "../data/datamanager.js";
import { authenticateToken } from "../middlewares/auth.js";

const booksRouter = express.Router();

booksRouter.get("/", (req, res) => {
  res.render("home");
});

booksRouter.get("/login", (req, res) => {
  res.render("login");
});

booksRouter.get("/books", authenticateToken, async (req, res) => {
  // console.log("admin : admin", bcrypt.hashSync("pwd", 10));
  const { available, overdue } = req.query;
  let booksData = readBooksData();
  if (available === "true") {
    booksData = booksData.filter((book) => book.isAvailable);
  }

  if (overdue === "true") {
    const today = new Date();
    booksData = booksData.filter((book) => {
      const returnDate = new Date(book.returnDate);
      return returnDate < today && !book.isAvailable;
    });
  }

  // res.json(booksData);
  res.render("books/index", { booksData, available, overdue });
});

booksRouter.get("/books/:id", authenticateToken, async (req, res) => {
  const bookId = Number(req.params.id);
  const booksData = readBooksData();
  const book = booksData.find((b) => b.id === bookId);
  if (!book) {
    res.status(404).send("Book is not defined");
    return;
  }

  let reader = null;
  if (book.readerId) {
    const userData = readUsersData();
    reader = userData.find((user) => user.id === book.readerId);

    if (!reader) {
      res.status(404).send("Reader is not defined");
      return;
    }
  }

  const bookToRender = { ...book, readerName: reader ? reader.username : "-" };
  res.render("books/book", { bookToRender });
});

booksRouter.put("/books/redact/:id", authenticateToken, async (req, res) => {
  const { author, datePublication, title } = req.body;
  const bookId = Number(req.params.id);
  const booksData = readBooksData();
  const book = booksData.find((b) => b.id === bookId);
  const bookIndex = booksData.findIndex((b) => b.id === bookId);
  if (!book) {
    res.status(404).send("Book is not defined");
    return;
  }

  const updatedBook = {
    ...book,
    author: author.trim() ? author : book.author,
    datePublication: datePublication.trim() ? datePublication : book.datePublication,
    title: title.trim() ? title : book.title, 
  };

  booksData[bookIndex] = updatedBook;

  writeBooksData(booksData);

  res.status(200).redirect(`/books/${bookId}`);
});

booksRouter.put("/books/takeit/:id", authenticateToken, async (req, res) => {
  const bookId = Number(req.params.id);
  const booksData = readBooksData();
  const book = booksData.find((b) => b.id === bookId);
  const bookIndex = booksData.findIndex((b) => b.id === bookId);

  if (!book) {
    res.status(404).send("Book is not defined");
    return;
  }

  if (book.readerId === req.user.id) {
    const tipMessage = "You have already taken this book.";
    return res.render("books/book", { 
      bookToRender: { 
        ...book, 
        readerName: req.user.username
      }, 
      tip: tipMessage 
    });
  }

  if (book.readerId) {
    const userData = readUsersData();
    const reader = userData.find((user) => user.id === book.readerId);

    const tipMessage = "This book is already taken by another user.";
    return res.render("books/book", { 
      bookToRender: { 
        ...book, 
        readerName: reader ? reader.username : "-"
      }, 
      tip: tipMessage 
    });
  }

  if (book.inStock) {
    book.inStock = false;
    book.readerId = req.user.id;

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 30);
    book.dateReturn = currentDate.toISOString().split("T")[0];
    booksData[bookIndex] = book;
    writeBooksData(booksData);

    return res.status(200).redirect(`/books/${bookId}`);
  }

  res.status(400).send("This book is not available for borrowing.");
});

booksRouter.put("/books/return/:id", authenticateToken, async (req, res) => {
  const bookId = Number(req.params.id);
  const booksData = readBooksData();
  const book = booksData.find((b) => b.id === bookId);
  const bookIndex = booksData.findIndex((b) => b.id === bookId);

  if (!book) {
    res.status(404).send("Book is not defined");
    return;
  }

  if (book.readerId !== req.user.id) {
    const tipMessage = "You cannot return a book you have not borrowed.";
    return res.render("books/book", { 
      bookToRender: { 
        ...book, 
        readerName: req.user.username
      }, 
      tip: tipMessage 
    });
  }

  book.inStock = true;
  book.readerId = null;
  book.dateReturn = null;

  booksData[bookIndex] = book;
  writeBooksData(booksData);

  res.status(200).redirect(`/books/${bookId}`);
});

// booksRouter.delete("/books/:id", async (req, res) => {});

export default booksRouter;

/*
7. Фильтрация книг с помощью AJAX
*/
