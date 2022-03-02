if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express');
const connectDB = require('./config/db');

const app = express();
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use(express.json({ extended: false}))

app.get('/', (req,res) => res.send('Api running'))

app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('server started'));
