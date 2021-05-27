const mongoose = require("mongoose"),
    Schema = mongoose.Schema;

const trailSchema = new Schema({
    name: String,
    descr: String, //description
    xCord: Number,
    yCord: Number,
    price: Number,
    length: Number,
    rating: Number
});

module.exports = mongoose.model("Trail", trailSchema);
