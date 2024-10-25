// controllers/usersControler.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addUser = async (req, res) => {
    try 
    {
        const { username, email, password } = req.body;
        const user = await prisma.user.create({ data: { username, email, password } });
        console.log(`User ${user.username} created successfully`);
        res.status(200).json({ message: "User created successfully", user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        console.error("User creation error:", error);
        if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
            res.status(400).json({ message: "Username already exists" });
        } else {
            res.status(500).json({ message: "User creation failed, please try again", error: error.message });
        }
    }
};


const getUser = async (req, res) => {
    try 
    {
        const { userName } = req.params;
        const user = await prisma.user.findUnique({ where: { userName: userName } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log(user + "fetched successfully");
        res.status(200).json({ message: "fetched successfully", user: user });
    } catch (error) {
        res.status(500).json({ message: "Fetching failed , please try again" , error: error.message });
    }
};


const loginUser = async (req, res) => {
    try 
    {
        const { userName, password } = req.body;
        const user = await prisma.user.findUnique({ where: { userName: userName } });
        
        if (!user) 
        {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        

        const isPasswordValid = user.password === password;
        
        if (!isPasswordValid) 
        {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        
        console.log(`User ${user.userName} logged in successfully`);
        res.status(200).json({ message: "Logged in successfully", user: { id: user.id, userName: user.userName, email: user.email } });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed, please try again", error: error.message });
    }
};

module.exports = { addUser, getUser, loginUser };
