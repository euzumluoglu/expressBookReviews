const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  const filtered_users = users.filter(user => user.username === username);
  return filtered_users.length === 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const filtered_users = users.filter(user => user.username === username && user.password === password);
  return filtered_users.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: { username: username }
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const review = req.body.review;
  if (review) {
    const ISBN = req.params.isbn;
    const book = books[ISBN];
    if (book) {
      const username = req.user.data.username;
      book.reviews[username] = review;
    } else {
      return res.status(404).json({message: "Book can not be found"});
    }
  } else {
    return res.status(404).json({message: "Review is missing"});
  }
  return res.status(200).json({message: "Updated successfully"});
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const ISBN = req.params.isbn;
  const book = books[ISBN];
  if (book) {
    const username = req.user.data.username;
    delete book.reviews[username];
  } else {
    return res.status(404).json({message: "Book can not be found"});
  }
  return res.status(200).json({message: "Deleted successfully"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
