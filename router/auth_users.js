const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();
let users = [];

// Helper: check if username already exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Helper: authenticate login credentials
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// ================= REGISTER =================
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Add new user
  users.push({ username, password });
  return res.status(201).json({ message: "Customer successfully registered. You can now login" });
});

// ================= LOGIN =================
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { username: username },
      "access",   // secret key
      { expiresIn: "1h" }
    );

    req.session.authorization = {
      accessToken, username
    };

    return res.status(200).json({ message: "Login successful", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// ================= ADD or UPDATE review =================
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Login required to add/update a review" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  // Add or update review
  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
});

// ================= DELETE review =================
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Login required to delete a review" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
  } else {
    return res.status(404).json({ message: "No review found for this user on this book" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
