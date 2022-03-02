const mongoose = require('mongoose');
const config = require('config');

// const db = config.get('DATABASE_URL');

const connectDB = () => {
    try {
         mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true
        })
const db = mongoose.connection

        db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))
    } catch(err) {
        console.error(err.message);
        // exit process with  failure
        process.exit(1);
    }
}

module.exports = connectDB;