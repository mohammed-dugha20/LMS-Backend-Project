import NotificationModel  from '../models/notification.model'
import { NextFunction,Response,Request } from 'express'
import { CatchAsyncError } from '../middlewares/catchAsyncError'
import ErrorHandler from '../utils/ErrorHandler'
import cron from 'node-cron'
// get All Notifications == Only Admin
export const getNotifications = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const notifications = await NotificationModel.find().sort({createdAt: -1});
        res.status(201).json({
            success:true,
            notifications
        })
     } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
})

export const getSingleNotifications = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const id = req.params.id
        const notification = await NotificationModel.findById(id).sort({createdAt: -1});
        res.status(201).json({
            success:true,
            notification
        })
     } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
})


export const updateNotification = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const notification = await NotificationModel.findById(req.params.id).sort({createdAt: -1});
        if(!notification){
            return next(new ErrorHandler("Notification Not Found ",404))
        }else{
            notification.status = 'read'
        }

        await notification.save()

        const notifications = await NotificationModel.find().sort({createdAt: -1})
        res.status(200).json({
            success:true,
            notifications
        })
     } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
})

// delete Notification 
cron.schedule("0 0 0 * * *",async()=>{
    const thirtyDayAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    await NotificationModel.deleteMany({status:"read",createdAt: {$lt: thirtyDayAgo}})
    console.log("Delete Read Notification");
    
})
