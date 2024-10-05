import { NextFunction,Response,Request } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel,{IOrder} from "../models/order.model";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import { getAllOrderService, newOrder } from "../services/order.service";

//create Order
export const createOrder = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {courseId,payment_info} = req.body as IOrder;

        const user = await userModel.findById(req.user._id);

        const courseExistInUser = user?.courses.some((course:any)=> course._id.toString === courseId);

        if(courseExistInUser){
            return next(new ErrorHandler('you have already purchased this course',400));
        }
        const course = await CourseModel.findById(courseId);
        
        if(!course){
            return next(new ErrorHandler('course not found',404));
        }

        const data:any = {
            courseId:course._id,
            userId: user?._id
        }
       

        const mailData = {
            order:{
                _id:course._id.toString().slice(0,6),
                name:course.name,
                price:course.price,
                date:new Date().toLocaleDateString('en-US',{year:'numeric', month:'numeric', day:'numeric'}),

            }
        }

        const html = await ejs.renderFile(path.join(__dirname,'../mails/order-confirmation.ejs'),{order:mailData});

        try {
            if(user){
                await sendMail({
                    email:user.email,
                    subject: "order confirmation",
                    template:"order-confirmation.ejs",
                    data: mailData
                })
            }
        } catch (error:any) {
            return next(new ErrorHandler(error.message,500))
        }

        user?.courses.push(course._id);

        await user?.save();

        const notification = await NotificationModel.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new Order from ${course?.name}`,
        });
        if(course.purchased)
            course.purchased +=1

        await course.save()

        newOrder(data,res,next);

       
    } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
})


// get all Order
export const getAllOrder = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
     getAllOrderService(res)
    } catch (error: any) {
      return next(new ErrorHandler(error.message,400))
    }
  })