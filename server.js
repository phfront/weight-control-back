require('rootpath')();
require('dotenv').config({
    path: process.env.NODE_ENV == "dev " ? ".dev.env" : ".env"
})

const mongoose = require('mongoose');
const boot = require('service/boot.js');

mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
console.log(process.env.DB_CONNECTION_STRING);
mongoose.connect(process.env.DB_CONNECTION_STRING, boot);