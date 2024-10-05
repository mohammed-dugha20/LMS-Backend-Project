class ErrorHandler extends Error{
    statusCode : Number;
    message: any;
    constructor(message:any,statusCode:Number){
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this,this.constructor)
    }
}

export default ErrorHandler