const express = require("express"),
    app = express(),
    path = require("path"),
    mongoose = require("mongoose"),
    Trail = require("./models/trail");

app.set("view engine", "ejs");
// explicitly set path to views for ejs
app.set("views", path.join(__dirname, "views"));

// connect mongoose to MongoDB first line is what important, options are just there
mongoose.connect("mongodb://localhost:27017/trails-app", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
    // .connect returns a promise, so you can use AJAX to check the connection
}).then(() => {
    console.log("Mongoose connected to Mongo");
}).catch(err => {
    console.log("Mongoose connection error", err)
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/makeTrail", async (req, res) => {
    const trail = new Trail({
        name: "Fort Yargo Loop",
        price: 5.0,
        rating: 4.0
    })
    await trail.save();
    res.send(trail);
});

app.listen(process.env.PORT || 3000, process.env.IP, () => {
    console.log("The Trail Server is up, listening on port 3000");
});
