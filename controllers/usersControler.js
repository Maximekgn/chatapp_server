// controllers/usersControler.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');


const secretKey = 'secret';

const addUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await prisma.user.create({ data: { username, email, password } });
        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
        console.log(`User ${user.username} created successfully`);
        res.status(201).json({
            message: "User created successfully",
            user: { id: user.id, username: user.username, email: user.email },
            token: token
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
        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

        console.log(`User ${user.username} logged in successfully`);
        res.status(200).json({ 
            message: "Logged in successfully", 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email 
            },
            token: token
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


const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Invalid or expired token" });
            }
            req.userId = decoded.userId;
            next();
        });
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Token verification failed" });
    }
};


module.exports = { addUser, getUser, loginUser, verifyToken };
