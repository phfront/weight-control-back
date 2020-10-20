const mongoose = require('mongoose');
const { Schema } = mongoose;

const Card = new Schema({
    id: Number,
    name: String,
    type: String,
    desc: String,
    atk: Number,
    def: Number,
    level: Number,
    race: String,
    attribute: String,
    archetype: String,
    scale: Number,
    linkVal: Number,
    linkMarkers: Number,
    card_images: [
        new Schema({
            id: Number,
            image_url: String,
            image_url_small: String,
        })
    ],
    count: Number,
});

module.exports = Card;