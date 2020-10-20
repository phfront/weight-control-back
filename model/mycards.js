const mongoose = require('mongoose');
const { Schema } = mongoose;
const Card = require('./card');

const MyCardsSchema = new Schema({
    userId: String,
    cards: [Card]
});

module.exports = mongoose.model('MyCards', MyCardsSchema);