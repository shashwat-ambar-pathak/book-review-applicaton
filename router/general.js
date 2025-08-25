const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// REGISTER new user (public)
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// ✅ GET full list of books using Promise
public_users.get('/', (req, res) => {
  new Promise((resolve, reject) => {
    if (books && Object.keys(books).length > 0) {
      resolve(books);
    } else {
      reject("No books available");
    }
  })
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json({ message: err }));
});

// ✅ GET book details by ISBN using Promise
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  })
    .then(data => res.status(200).json(data))
    .catch(err => res.status(404).json({ message: err }));
});

// ✅ GET books by author using Promise
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();

  new Promise((resolve, reject) => {
    let filteredBooks = [];
    Object.keys(books).forEach(key => {
      if (books[key].author.toLowerCase() === author) {
        filteredBooks.push(books[key]);
      }
    });

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("No books found for this author");
    }
  })
    .then(data => res.status(200).json(data))
    .catch(err => res.status(404).json({ message: err }));
});

// ✅ GET books by title using Promise
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  new Promise((resolve, reject) => {
    let filteredBooks = [];
    Object.keys(books).forEach(key => {
      if (books[key].title.toLowerCase() === title) {
        filteredBooks.push(books[key]);
      }
    });

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("No books found with this title");
    }
  })
    .then(data => res.status(200).json(data))
    .catch(err => res.status(404).json({ message: err }));
});

// ✅ GET book reviews using Promise
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book.reviews || {});
    } else {
      reject("Book not found");
    }
  })
    .then(data => res.status(200).json(data))
    .catch(err => res.status(404).json({ message: err }));
});

module.exports.general = public_users;
