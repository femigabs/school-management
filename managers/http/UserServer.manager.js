const http              = require('http');
const express           = require('express');
const cors              = require('cors');
const rateLimit = require("express-rate-limit");
const app               = express();
const {
    tooManyRequestError,
    notFoundError,
} = require("../_common/error.handler");

const globalLimiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS,
    max: process.env.RATE_LIMIT_MAX_REQUESTS,
    keyGenerator: (req) => req.ip,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json(tooManyRequestError('You have exceeded the rate limit. Please try again later'));
    },
});

module.exports = class UserServer {
    constructor({config, managers}){
        this.config        = config;
        this.userApi       = managers.userApi;
    }
    
    /** for injecting middlewares */
    use(args){
        app.use(args);
    }

    /** server configs */
    run(){
        app.use(cors({origin: '*'}));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true}));
        app.use('/static', express.static('public'));

        // Apply the global rate limiter to all requests
        app.use(globalLimiter);

        /** an error handler */
        app.use((err, req, res, next) => {
            console.error(err.stack)
            res.status(500).send('Something broke!')
        });
        
        /** a single middleware to handle all */
        app.all('/api/:moduleName/:fnName/:id?', this.userApi.mw);

        app.use((req, res, next) => {
            res.status(404).send(notFoundError('Route not found!'))
        });

        let server = http.createServer(app);
        server.listen(this.config.dotEnv.USER_PORT, () => {
            console.log(`${(this.config.dotEnv.SERVICE_NAME).toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`);
        });
    }
}