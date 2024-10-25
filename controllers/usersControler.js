// controllers/usersControler.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addUser = async (req, res) => {
    try 
    {
        const { userName, email, password } = req.body;
        const user = await prisma.user.create({ data: { userName, email, password } });
        console.log(user + "created successfully");
        res.status(200).json({ message: "User created successfully", user: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getUser = async (req, res) => {
    try 
    {
        const { userName } = req.params;
        const user = await prisma.user.findUnique({ where: { userName: userName } });
        console.log(user + "fetched successfully");
        res.status(200).json({ message: "fetched successfully", user: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const loginUser = async (req, res) => {
    try 
    {
        const { userName, password } = req.body;
        const user = await prisma.user.findUnique({ where: { userName: userName, password: password } });
        if (!user) 
        {
            res.status(401).json({ message: "Invalid username or password" });
        }
        console.log(user + "logged in successfully");
        res.status(200).json({ message: "logged in successfully", user: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addUser, getUser, loginUser };
