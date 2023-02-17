import { logger } from "../config/logger.js";

export function logRequest(req, res, next){
    // Makes log
    req.logError = function (err) {
        logger.error(`Something goes wrong: ${err}`)
    };
    logger.info(`The requested route is ${req.url} with ${req.method} method`);
    next();
};

export function logNotImplementedRequest(req, res, next){
    logger.warn(`Requested route ${req.url} with ${req.method} method is not implemented`);
    next();
};