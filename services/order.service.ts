import { NextFunction,Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import OrderModel from "../models/order.model";
import CourseModel from "../models/course.model";

// create new Order

export const newOrder = CatchAsyncError(async(data:any,next:NextFunction,res:Response)=>{
    const order = await OrderModel.create(data);
    return res.status(200).json({
        success:true,
        message:'course order successfuly',
        order
    })
})



export const getAllOrderService = async (res: Response) => {
    const orders = await OrderModel.find().sort({createdAt:-1});
  
      return res.status(200).json({
        success: true,
        data: orders,
      });
    
  };
