const mongoose = require('mongoose')
require('dotenv').config();

// prefer mongo_url but accept common names
const url = process.env.mongo_url || process.env.MONGO_URL || process.env.MONGO_URI;

function connectMongoDB(){
    if (!url) {
        console.warn("MongoDB connection URL is not defined. Set 'mongo_url' or 'MONGO_URL' in Backend/.env.");
        // do not exit here so server can run for non-db work while you fix env
        return Promise.resolve(false);
    }
    return mongoose.connect(url)
      .then(() => {
        console.log('MongoDB Connected successfully');
        return true;
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        return false;
      });
}

module.exports = connectMongoDB;