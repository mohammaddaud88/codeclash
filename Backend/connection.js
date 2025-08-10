const mongoose = require('mongoose')
const url = "mongodb+srv://daudansarikld:admin0000@codeclash.kcs3ss0.mongodb.net/?retryWrites=true&w=majority&appName=CodeClash"

function connectMongoDB(){
    mongoose.connect(url).then(()=>{
        console.log('MongoDB Connected successfully')
    })
}

module.exports = connectMongoDB;