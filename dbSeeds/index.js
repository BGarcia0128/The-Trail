const mongoose = require("mongoose"),
    Trail = require("../models/trail"),
    {
        loc,
        adj,
        secAdj,
        type
    } = require("./traits.js");

// connect mongoose to MongoDB first line is what important, options are just there
mongoose.connect("mongodb://localhost:27017/trails-app", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
    // .connect returns a promise, so you can use AJAX to check the connection
}).then(() => {
    console.log("Connected to DB");
}).catch(err => {
    console.log("Mongoose connection error", err)
});

/******************************************************************************************/

seedDB(6).then(() => { // This erases all items in DB first, careful
    mongoose.connection.close();
    console.log("connection closed");
});

/******************************************************************************************/
async function seedDB(numOfSeeds) {
    await Trail.deleteMany({});
    for (let i = 0; i < numOfSeeds; i++) {
        const trail = new Trail(createSeed());
        await trail.save();
    }
    console.log("DB Seeded");
}

const createSeed = () => {
    return {
        name: `${randomArrayItem(adj)} ${randomArrayItem(secAdj)} ${randomArrayItem(type)}`,
        loc: `${randomArrayItem(loc)}`,
        img: 'https://source.unsplash.com/random/2560x1080/?nature,trail',
        desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Mus mauris vitae ultricies leo. Pulvinar mattis nunc sed blandit libero volutpat. Vitae proin sagittis nisl rhoncus mattis rhoncus urna neque. Tristique et egestas quis ipsum. Neque convallis a cras semper auctor neque vitae tempus quam. Ipsum a arcu cursus vitae congue mauris rhoncus aenean vel. Eget egestas purus viverra accumsan in nisl nisi scelerisque eu. Facilisi nullam vehicula ipsum a arcu cursus vitae. Non diam phasellus vestibulum lorem sed. Magnis dis parturient montes nascetur ridiculus. Dictum non consectetur a erat nam at lectus urna. Risus at ultrices mi tempus imperdiet. Feugiat scelerisque varius morbi enim. Faucibus et molestie ac feugiat sed. Et pharetra pharetra massa massa. Id cursus metus aliquam eleifend mi in nulla.',
        length: randomNum(5, 20, .1),
        rating: randomNum(3, 5, 1)
    }
}

const randomNum = (min, max, interval) => {
    let num = Math.random() * (max - min) + min;
    let result = Math.round(num / interval) * interval;
    return result.toFixed(2); //only supports intervals as low as 0.01

}

const randomArrayItem = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
}
