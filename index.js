const express = require("express");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
const prisma = new PrismaClient();
dotenv.config();

//---------------- Middleware ----------------
app.use(express.json());
app.use(cors({
    credentials: true
}));

app.use("*", (req, res, next) => {
    console.log("Request received ", req.method, req.url , req.ip);
    next();
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
  });

//---------------- Server ----------------
const PORT = process.env.PORT || 3500;

app.get("/test", (req, res) => {
    console.log("test is working!");
    res.send("test is working!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

//--------------- API Routes ---------------
app.get("/", (req, res) => {
    res.send("Welcome to your online chat server!");
});

// Register user
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword, // Save hashed password
            },
        });
        
        const token = jwt.sign({ userId: user.id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            message: "User created successfully",
            token,
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "An error occurred during registration" });
    }
});

// Login user
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Check the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ userId: user.id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(200).json({
            message: "Login successful",
            token,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
});

// Logout user (In this case, just a client-side action to delete the token)
app.post("/logout", (req, res) => {
    // Clear the client-side token
    res.status(200).json({ message: "Logged out successfully" });
});

// Get user information (Protected route)
app.get("/user", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            username: user.username,
            email: user.email,
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(403).json({ message: "Invalid token" });
    }
});

// Update user (example for updating username and email)
app.put("/user", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { username, email } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: decoded.userId },
            data: { username, email },
        });

        res.status(200).json({
            message: "User updated successfully",
            user: {
                username: updatedUser.username,
                email: updatedUser.email,
            },
        });
    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ message: "An error occurred during user update" });
    }
});