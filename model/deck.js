const mongoose = require('mongoose');
const { Schema } = mongoose;

const DeckSchema = new Schema({
    userId: String,
    name: String,
    createdBy: String,
    main: [Number],
    extra: [Number],
    side: [Number],
});

module.exports = mongoose.model('deck', DeckSchema);