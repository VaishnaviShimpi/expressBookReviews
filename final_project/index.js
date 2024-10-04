const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized access, please provide a valid token" });
    }

    // Verify the token (assuming JWT)
    const tokenWithoutBearer = token.split(" ")[1]; // Get the token part
    jwt.verify(tokenWithoutBearer, "your-secret-key", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden, invalid token" });
        }

        // Token is valid, store user info for future use
        req.user = decoded; 
        next(); // Continue to the next middleware or route
    });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));
