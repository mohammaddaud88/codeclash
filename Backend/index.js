const mongoConnection = require('./connection')
const express = require('express')
const app = express()
const PORT = 8000
const authRoutes = require('./routes/authroutes')
const dotenv = require('dotenv').config();


// Middlewares
app.use(express.json()); 

// maped routes
app.use('/auth',authRoutes);







mongoConnection();
app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT}`);
})