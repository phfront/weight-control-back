const mongoose = require('mongoose');
const { Schema } = mongoose;

const ForgetRedirectSchema = new Schema({
    userId: String,
    hash: String,
    datetime: Date
});

module.exports = mongoose.model('forgotRedirect', ForgetRedirectSchema);