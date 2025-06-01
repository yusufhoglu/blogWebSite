require('dotenv').config()
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));
app.set("trust proxy", 1);
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}));

// MongoDB bağlantısı
const url = process.env.MONGODB_URL;
mongoose.connect(url, {useNewUrlParser: true})
.then(()=> console.log("Connected to MongoDB!"))
.catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use('/', postRoutes);
app.use('/', authRoutes);

// Server başlatma
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})