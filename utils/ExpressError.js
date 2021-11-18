class ExpressError extends Error {
    constructor(status, message) {
        super();
        this.status = status;
        this.message = message;
    }
}






module.exports = ExpressError;

/* like Java, JS is object oriented. Error is a class that shows up when a user encounters a problem.
however vanilla JS errors dont have status codes or messages. So we extend Error and add them to its
constructor along with all other properties */
