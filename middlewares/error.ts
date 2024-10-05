import { Request,Response,NextFunction } from 'express';
import ErrorHandler from '../utils/ErrorHandler';

export const ErrorMiddleware = (
    err:any,
    req:Request,
    res:Response,
    next:NextFunction
    )=>{
    
        err.statusCode = err.statusCode  || 500
        err.message = err.message || "Internal Server Error"

        // wrong mongodb Id error
        if(err.name === 'CastError'){
            const message = `Resource Not found, Invalid ${err.path}`;
            err = new ErrorHandler(message,400);
        }

        // duplicate any error
        if(err.statusCode === 11000){
            const message = `Duplicate ${Object.keys(err.keyValue)} entered`
            err = new ErrorHandler(message,400)
        }

        //wrong jwt Error
        if(err.name === 'JsonWebTokenError'){
            const message = 'Json Web token is Invalid,Try Again..!'
            err= new ErrorHandler(message,400)
        }

        // jwt Expired error
        if(err.name === 'TokenExpiredError'){
            const message = `Json web token is expired, try again..!`
            err = new ErrorHandler(message,400)
        }

        res.status(err.statusCode).json({
            success:false,
            message:err.message
        })
}
