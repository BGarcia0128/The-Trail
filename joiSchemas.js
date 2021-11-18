const Joi = require("Joi");

module.exports.trailSchema = Joi.object({ //this defines the pattern Joi will check for
    trail: Joi.object({ //remember our form returns trail{obj}, see newTrail.ejs
        name: Joi.string().required(),
        img: Joi.string().required(),
        desc: Joi.string().required(), //description
        loc: Joi.string().required(), //location
        length: Joi.number().min(0).required(), //in miles
        rating: Joi.number().min(0).max(5).required()
    }).required() //this ensures the whole trail{} isnt empty
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        title: Joi.string().required(),
        rating: Joi.number().min(0).max(5).required(),
        body: Joi.string().allow(null, '') // explicitly allows empty
    }).required()
});
