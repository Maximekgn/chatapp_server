//----------- IMPORTS ----------------
const express = require('express');
const app = express();
const cors = require('cors');
const { addUser, getUser, loginUser, verifyToken } = require('./controllers/usersControler');

//----------- SERVER CONFIG ----------------
const port = 3500;

//----------- MIDDLEWARE ----------------
app.use(cors());
app.use(express.json());


//----------- ROUTES ----------------
app.get('/', (req, res) => {
  res.send('Welcome to server');
});

app.post('/addUser', addUser);
app.get('/getUser', getUser)
app.post('/loginUser', loginUser);
app.get('/verifyToken', verifyToken);

//----------- SERVER START ----------------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

