const mongoConnection = require('./connection')
const express = require('express')
const app = express()
const PORT = 8000
const authRoutes = require('./routes/authroutes')
const cors = require('cors');
const cookieParser = require('cookie-parser');


// Middlewares
app.use(express.json()); 
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}))
app.use(cookieParser())

// maped routes
app.use('/auth',authRoutes);







mongoConnection();
app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT}`);
})