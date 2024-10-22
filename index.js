const express = require("express");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();
dotenv.config();

//---------------- Middleware ----------------

app.use(express.json());

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true); // autorise toutes les origines
  },
  credentials: true
}));

app.use("*", (req, res, next) => {
  console.log("Request received ", req.method, req.url, req.ip);
  next();
});

app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', origin); // Utilise l'origine de la requête
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

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: password,
            },
        });

        res.status(201).json({
            message: "User created successfully",
            user: {
                username: user.username,
                email: user.email,
            },
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

        if (password !== user.password) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An error occurred during login" });
    }
});

// Logout user
app.post("/logout", (req, res) => {
    res.status(200).json({ message: "Logged out successfully" });
});

// Get user information
app.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ message: "An error occurred while fetching user data" });
    }
});

// Update user (example for updating username and email)
app.put("/user/:userId", async (req, res) => {
    const { userId } = req.params;
    const { username, email } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
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