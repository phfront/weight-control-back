const mongoose = require('mongoose');
const { Schema } = mongoose;

const WeightSchema = new Schema({
    userId: String,
    weight: Number,
    datetime: Date,
});

module.exports = mongoose.model('weight', WeightSchema);