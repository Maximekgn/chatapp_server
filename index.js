const express = require("express");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");    

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
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization');
  next();
});

// Middleware pour vérifier le token JWT
const verifyToken = (req, res, next) => {

    if (req.url === "/register" || req.url === "/login") {
        return next();
    }

  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: "Un token est requis pour l'authentification" });
  
  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
  return next();
};

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

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: "User created successfully",
            user: {
                username: user.username,
                email: user.email,
            },
            token: token
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

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: "Login successful",
            user: {
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            },
            token: token
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

