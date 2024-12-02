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
  const { available, returned } = req.query;
  let booksData = readBooksData();

  if (available === "true") {
    booksData = booksData.filter((book) => book.inStock);
  }

  if (returned === "true") {
    booksData = booksData
      .filter((book) => book.dateReturn)
      .sort((a, b) => new Date(a.dateReturn) - new Date(b.dateReturn));
  }

  if (req.xhr || req.headers.accept.indexOf("json") > -1) {
    res.json(booksData);
  } else {
    res.render("books/index", {
      booksData,
      filterState: {
        available: available === "true",
        returned: returned === "true",
      },
    });
  }
});

booksRouter.get("/books/:id", authenticateToken, async (req, res) => {
  const bookId = req.params.id;
  const booksData = readBooksData();
  const usersData = readUsersData();
  const bookToRender = booksData.find(book => book.id === parseInt(bookId));

  if (!bookToRender) {
    return res.status(404).send("Book not found");
  }
  
  if (bookToRender.readerId) {
    const reader = usersData.find(user => user.id === bookToRender.readerId);
    bookToRender.readerName = reader ? reader.username : "Unknown user";
  } else {
    bookToRender.readerName = "No reader";
  }

  res.render("books/book", {
    bookToRender,
    user: req.user
  });
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
    datePublication: datePublication.trim()
      ? datePublication
      : book.datePublication,
    title: title.trim() ? title : book.title,
  };

  booksData[bookIndex] = updatedBook;
  writeBooksData(booksData);
  res.status(200).redirect(`/books/${bookId}`);
});

booksRouter.post("/books/takeit/:id", authenticateToken, async (req, res) => {
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
        readerName: req.user.username,
      },
      tip: tipMessage,
    });
  }

  if (book.readerId) {
    const userData = readUsersData();
    const reader = userData.find((user) => user.id === book.readerId);
    const tipMessage = "This book is already taken by another user.";
    return res.render("books/book", {
      bookToRender: {
        ...book,
        readerName: reader ? reader.username : "-",
      },
      tip: tipMessage,
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

booksRouter.post("/books/return/:id", authenticateToken, async (req, res) => {
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
        readerName: req.user.username,
      },
      tip: tipMessage,
    });
  }

  book.inStock = true;
  book.readerId = null;
  book.dateReturn = null;

  booksData[bookIndex] = book;
  writeBooksData(booksData);
  res.status(200).redirect(`/books/${bookId}`);
});

booksRouter.delete("/books/:id", async (req, res) => {
  const bookId = Number(req.params.id);
  const booksData = readBooksData();
  const book = booksData.find((b) => b.id === bookId);
  const bookIndex = booksData.findIndex((b) => b.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).send("Book is not defined");
  }

  if (book.readerId) {
    const tipMessage = "You cannot delete a book, which is not available.";
    return res.render("books/index", { booksData: booksData, tip: tipMessage });
  }

  booksData.splice(bookIndex, 1);
  writeBooksData(booksData);
  res.status(200).redirect("/books");
});

booksRouter.post("/books/add", authenticateToken, async (req, res) => {
  const booksData = readBooksData();
  const { id: maxId } = booksData.reduce((max, current) => {
    return current.id > max.id ? current : max;
  }, booksData[0]);

  const newBook = {
    id: maxId + 1,
    title: req.body.title,
    author: req.body.author,
    datePublication: req.body.datePublication,
    description: req.body.description || "",
    inStock: true,
    readerId: null,
    dateReturn: null,
  };
  booksData.push(newBook);
  writeBooksData(booksData);
  res.redirect("/books");
});

export default booksRouter;
