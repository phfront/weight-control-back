const mongoose = require('mongoose');
const { Schema } = mongoose;

const MyCardsSchema = new Schema({
    userId: String,
    cards: [Number]
});

module.exports = mongoose.model('MyCards', MyCardsSchema);