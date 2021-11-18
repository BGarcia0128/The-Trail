module.exports = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
};

/* this is just a function that takes in a function and wraps it in a try catch for express.
it turns someting with no error handling like this...

 app.post("/trails", async (req, res) => {
    const newTrail = new Trail(req.body.trail);
    await newTrail.save();
    res.redirect(`/trails/${newTrail._id}`);
});

into this...

app.post("/trails", async (req, res, next) => {
    try {
        const newTrail = new Trail(req.body.trail);
        await newTrail.save();
        res.redirect(`/trails/${newTrail._id}`);
    } catch (e) {
        next(e);
    }
});

all by keeping it simple like this...

app.post("/trails", tryAsync(async (req, res, next) => {
    const newTrail = new Trail(req.body.trail);
    await newTrail.save();
    res.redirect(`/trails/${newTrail._id}`);
}));

*/
