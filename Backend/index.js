const mongoConnection = require('./connection')
const express = require('express')
const app = express()
const PORT = 8000













mongoConnection();
app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT}`);
})