const mongoose = require('mongoose');
const { Schema } = mongoose;
const Card = require('./card');

const DeckSchema = new Schema({
    userId: String,
    name: String,
    createdBy: String,
    main: [Card],
    extra: [Card],
    side: [Card],
});

module.exports = mongoose.model('deck', DeckSchema);