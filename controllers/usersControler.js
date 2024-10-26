// controllers/usersControler.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await prisma.user.create({ data: { username, email, password } });
        console.log(`User ${user.username} created successfully`);
        req.session.user = { id: user.id, username: user.username, email: user.email };
        res.status(201).json({
            message: "User created successfully",
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error("User creation error:", error);
        if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
            res.status(400).json({ message: "Username already exists" });
        } else {
            res.status(500).json({ message: "User creation failed, please try again" });
        }
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { username } });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        console.log(`User ${user.username} logged in successfully`);
        req.session.user = { id: user.id, username: user.username, email: user.email };
        res.status(200).json({ 
            message: "Logged in successfully", 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email 
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed, please try again" });
    }
};

const getUser = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`User ${user.username} fetched successfully`);
        res.status(200).json({
            message: "User fetched successfully",
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error("User fetch error:", error);
        res.status(500).json({ message: "Fetching user failed, please try again" });
    }
};

module.exports = { addUser, getUser, loginUser };
