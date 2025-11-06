const mongoConnection = require('./connection')
const express = require('express')
const app = express()
const PORT = 8000
const authRoutes = require('./routes/authroutes')
const dotenv = require('dotenv').config();
// const cors = require('cors');
const cookieParser = require('cookie-parser');
const codeRoutes = require('./routes/code')
require('dotenv').config();
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
const profileRoutes = require('./routes/profileroutes')

// Middlewares
const geminiRoutes = require('./routes/geminiRoute');
app.use('/gemini', geminiRoutes);
app.use(express.json()); 
app.use(cookieParser())

// maped routes
app.use('/auth',authRoutes);
app.use('/code',codeRoutes);
app.use('/api',profileRoutes)


mongoConnection();
app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT}`);
})