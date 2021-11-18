const mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Review = require("./review.js");

const trailSchema = new Schema({
    name: String,
    img: String,
    desc: String, //description
    loc: String, //location
    xCord: Number,
    yCord: Number,
    price: Number,
    length: Number, //in miles
    rating: Number,
    /* Mongo relationships with mongoose:
    If you want two schemas/models to be linked, and want more than just embedded,
    you need to tell mongoose youre using an obect's Id, then reference the model */
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }]
});

/* Mongoose middleware- there are pre and post. Think of these as event listeners.
model.post(event, function());
In the case below, when ever a Trail model is queried by findOneAndDelete,
the middleware runs. Recall, to delete a trail in app.js you call
Trail.findByIdAndDelete(id) which under the hood calls findOneAndDelete(). 
To find your method see https://mongoosejs.com/docs/api.html */
trailSchema.post("findOneAndDelete", async (trail) => {
    /* If a trail is found, it will go into Review collection and remove an item
    with the given _id. In this case, all ids $in the trails.reviews array*/
    if (trail) {
        await Review.deleteMany({
            _id: {
                $in: trail.reviews
            }
        })
    }
});

module.exports = mongoose.model("Trail", trailSchema);
