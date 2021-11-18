/***************************** Initialize constants *****************************/
const express = require("express"),
    app = express(),
    ejsMate = require("ejs-mate"),
    path = require("path"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    Trail = require("./models/trail"),
    Review = require("./models/review"),
    tryAsync = require("./utils/tryAsync"),
    ExpressError = require("./utils/ExpressError"),
    Joi = require("joi"),
    {
        trailSchema,
        reviewSchema
    } = require("./joiSchemas.js");

/************************ Prepare EJS / Mongoose / Mongo ************************/

app.set("view engine", "ejs");
/*  EJS has multiple engines, in this case we're telling express we want it to use
    ejsMate for ejs rather than the default*/
app.engine("ejs", ejsMate);
// explicitly set path to views for ejs
app.set("views", path.join(__dirname, "views"));
app.use('/Public', express.static('Public'));
app.use(bodyParser.urlencoded({
            extended: true
}));

// connect mongoose to MongoDB first line is what important, options are just there
mongoose.connect("mongodb://localhost:27017/trails-app", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
    // .connect returns a promise, so you can use .then(), to check the connection
}).then(() => {
    /*console.log("Connected to DB");*/
}).catch(err => {
    console.log("Mongoose connection error", err)
});

// method override; you can pass in anything as long as it makes sense
app.use(methodOverride('_method'));

/**************************** Functions / Middleware ****************************/

const validateTrail = (req, res, next) => { // remember, express middleware needs next()
    // this is a Joi method, it returns an obj{} but you want to see if obj.error exists
    const {
        error
    } = trailSchema.validate(req.body);
    if (error) {
        // extract all messages in error.details[] into one string
        const errMessages = error.details.map(item => item.message).join(", ");
        throw new ExpressError(400, errMessages);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const {
        error
    } = reviewSchema.validate(req.body);
    if (error) {
        const errMessages = error.details.map(item => item.message).join(", ");
        throw new ExpressError(400, errMessages);
    } else {
        next();
    }
}

/******************************* Routes / Server *******************************/

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/news", tryAsync(async (req, res) => {
    res.render("trails/index", {
        trailsList
    });
}));

/*  when querying for an item, remember DB communication takes time
    (a)wait for it to retrieve */
app.get("/trails", tryAsync(async (req, res) => {
    const trailsList = await Trail.find({});
    res.render("trails/index", {
        trailsList
    });
}));

app.get("/trails/new", (req, res) => {
    res.render("trails/newTrail");
});

/* Add client side error handling in express is with next().
pass in "next" to your callback, then wrap it in a try catch, see utils/tryAsync,
the catch takes in the error, then calls next(err), this takes the logic to the next app.use.
Use custom Joi middleware validateTrail to add server side error handling */
app.post("/trails", validateTrail, tryAsync(async (req, res, next) => {
    //info is drawn from req.body, which contains html input elements, see newTrail.ejs
    const newTrail = new Trail(req.body.trail);
    await newTrail.save();
    res.redirect(`/trails/${newTrail._id}`);
}));

app.get("/trails/:id", tryAsync(async (req, res, next) => {
    /* .populate(string) needs to be called on a mongoose query
    .exec() is mongoose's way of dealing with the promise */
    const trail = await Trail.findById(req.params.id).populate("reviews").exec();
    res.render("trails/viewTrail", {
        trail
    });
}));

app.get("/trails/:id/edit", tryAsync(async (req, res) => {
    const trailToEdit = await Trail.findById(req.params.id).exec();
    res.render("trails/editTrail", {
        trailToEdit
    });
}));

/*  .put is an "update" request and requires method-override to be installed and "app.use"d
    see editTrail.ejs to see requirements on the html side */
app.put("/trails/:id", validateTrail, tryAsync(async (req, res) => {
    const updatedInfo = req.body.trail;
    const updateTrail = await Trail.findByIdAndUpdate(req.params.id, updatedInfo).exec();
    res.redirect(`/trails/${req.params.id}`);
}));

// To delete all child relationships use mongoose middleware. See models/trail.js
app.delete("/trails/:id", tryAsync(async (req, res) => {
    const trailToDelete = await Trail.findByIdAndDelete(req.params.id).exec();
    res.redirect(`/trails`);
}));

app.post("/trails/:id/reviews", validateReview, tryAsync(async (req, res, next) => {
    const newReview = new Review(req.body.review);
    await newReview.save();
    let reviewedTrail = await Trail.findById(req.params.id);
    reviewedTrail.reviews.push(newReview);
    reviewedTrail.save();
    res.redirect(`/trails/${req.params.id}`);
}));

// delete a child in a mongo relationship
app.delete("/trails/:id/reviews/:reviewId", tryAsync(async (req, res, next) => {
    const {
        id,
        reviewId
    } = req.params;
    /* Update the parent, 2nd param is {$pull: {propOfParent: query} }
    this will "pull" out the specific item, in this case an id in an array*/
    await Trail.findByIdAndUpdate(id, {
        $pull: {
            reviews: reviewId
        }
    }).exec();
    await Review.findByIdAndDelete(reviewId).exec();
    res.redirect(`/trails/${id}`);
}));

/********************************* Error Handling *********************************/
// catches anything not matching above routes. by itself does nothing, combine with next() and ExpressError
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
})
/* remember, app.use is an express method that runs during EVERY request
it only shows up when a route messes up and tryAsync calls next() */
app.use((err, req, res, next) => {
    /* default page renders "500 Something went wrong!" on error.ejs,
    otherwise uses info passed from a next() or tryAsync(), with ExpressError */
    const {
        status = 500
    } = err;
    if (!err.message) {
        err.message = "Something went wrong!";
    }
    res.status(status).render("error", {
        err
    });
})

app.listen(process.env.PORT || 3000, process.env.IP, () => {
    console.log("The Trail Server is up, listening on port 3000");
});
