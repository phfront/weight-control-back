require('rootpath')();

const mongoose = require('mongoose');
const config = require('config.json');
const boot = require('service/boot.js');

mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(config.db.connectionString, boot);

