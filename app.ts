const express = require("express");
const app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
require("dotenv").config();
const cors = require("cors");

//---------------- Middleware ----------------
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
    res.send("Welcome to your online chat server!");
});

//---------------- Server ----------------
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

//---------------api routes---------------

// register user
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password,
            },
        });

        res
            .status(201)
            .json({
                message: "User created successfully",
                user: { id: user.id, username: user.username, email: user.email },
            });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "An error occurred during registration" });
    }
});

// login user

// logout user

// get user

// update user
