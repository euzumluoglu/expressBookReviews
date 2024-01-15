const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const findByIsin = (ISBN) => {
  return new Promise((resolve, reject) => {
    const book =  books[ISBN];
    if (book) {
      resolve(book);
    } else {
      reject(`No book found with ISIN = ${ISBN}`)
    }
  })
}

const getBooksArray = () => {
  return new Promise((resolve, reject) => {
    resolve(books);
  })
}
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return new Promise((resolve, reject) => {
    resolve(books);
  }).then(res.status(200).json(JSON.stringify(books)));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const ISBN = req.params.isbn;
  return findByIsin(ISBN)
      .then(book => res.status(200).json(JSON.stringify(book)))
      .catch(err => res.status(404).json(err.message));
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  return getBooksArray()
      .then(books => books.filter((book) => book.author === author))
      .then(filtered_books => res.status(200).json(res.status(200).json(JSON.stringify(filtered_books))));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  return getBooksArray().then(
      books => books.filter((book) => book.title === title)
  ).then(
      filtered_books => res.status(200).json(res.status(200).json(JSON.stringify(filtered_books)))
  );
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const ISBN = req.params.isbn;
  return findByIsin(ISBN)
      .then(book => res.status(200).json(JSON.stringify(book.reviews)))
      .catch(err => res.status(404).json(err));
});

module.exports.general = public_users;
