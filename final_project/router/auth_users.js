const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if the username is valid (already registered)
const isValid = (username) => {
    return users.some(user => user.username === username);
}

// Function to authenticate user based on username and password
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username && user.password === password);
    return user !== undefined;
}

// Register a new user
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Add new user to the users array
    users.push({ username, password });

    return res.status(200).json({ message: "User registered successfully" });
});

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the user is registered
    if (!isValid(username)) {
        return res.status(404).json({ message: "User not found" });
    }

    // Authenticate the user
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token for the authenticated user
    const token = jwt.sign({ username: username }, 'your-secret-key', { expiresIn: '1h' });

    return res.status(200).json({ message: "Login successful", token: token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const username = req.user.username; // JWT-authenticated user's username

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Adding or modifying the review for the book
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // If the same user has posted a review, it will get modified
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: `Review added/modified for book with ISBN ${isbn}` });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username; // Retrieve the username from the JWT payload

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user's review exists
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete the user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: `Review deleted for book with ISBN ${isbn}` });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
