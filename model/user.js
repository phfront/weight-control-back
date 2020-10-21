const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: String,
    email: String,
    username: String,
    password: String,
    theme: String,
});

module.exports = mongoose.model('user', UserSchema);