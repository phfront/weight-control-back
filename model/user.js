const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: String,
    email: String,
    username: String,
    password: String,
    config: {
    	targetWeight: Number,
    },
});

module.exports = mongoose.model('users', UserSchema);