import { Request,Response,NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import LayoutModel from "../models/layout.models";
import cloudinary from "cloudinary"




// create Layout
export const createLayout = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {type} = req.body;
        const isTypeExist = await LayoutModel.findOne({type})
        if(isTypeExist){
            return next(new ErrorHandler(`${type} is already exist`,400))
        }
        if(type === "Banner"){
            const {image,title,subTitle} = req.body
            const myCloud = await cloudinary.v2.uploader.upload(image,{
                folder: "layout"
            });
            const banner = {
                image:{
                    public_id:myCloud.public_id,
                    url:myCloud.secure_url,
                },
                title,
                subTitle
            }
            await LayoutModel.create(banner)
        }

        if(type === "FAQ"){
            const {faq} = req.body
            const FaqItems = await Promise.all(
                Object.values(faq).map(async(item:any) =>{
                    return {
                        question: item.question,
                        answer: item.answer
                    }
                })
            )
            await LayoutModel.create({type:"FAQ",faq:FaqItems})
        }

        if(type === "Categories"){
            const {categories} = req.body;
            const categoriesItem = await Promise.all(
                Object.values(categories).map(async(item:any) =>{
                    return {
                       title:item.title
                    }
                })
            )
            await LayoutModel.create({type:"Categories",categories:categoriesItem})

        }

        res.status(201).json({
            success:true,
            message:"Layout Created Successfuly"
        })
    }catch(error:any){
        return next(new ErrorHandler(error.message,500))
    }
})

// Edit Layout
export const editLayout = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {

        const {type} = req.body;
       
        if(type === "Banner"){
            const bannerData:any = await LayoutModel.findOne({type:"Banner"});
            const {image,title,subTitle} = req.body

            if(bannerData)
                await cloudinary.v2.uploader.destroy(bannerData.image.public_id)
            
            const myCloud = await cloudinary.v2.uploader.upload(image,{
                "folder":"layout"
            })

            const banner = {
                type:"Banner",
                image:{
                    public_id:myCloud.public_id,
                    url:myCloud.secure_url,
                },
                title,
                subTitle
            }
            await LayoutModel.findByIdAndUpdate(bannerData._id,{banner})
        }

        if(type === "FAQ"){
            const {faq} = req.body;
            const faqItem = await LayoutModel.findOne({type:"FAQ"})
            const FaqItems = await Promise.all(
                Object.values(faq).map(async(item:any) =>{
                    return {
                        question: item.question,
                        answer: item.answer
                    }
                })
            )
            await LayoutModel.findByIdAndUpdate(faqItem?._id,{type:"FAQ",faq:FaqItems})
        }

        if(type === "Categories"){
            const {categories} = req.body;
            const category = await LayoutModel.findOne({type:"Categories"})

            const categoriesItem = await Promise.all(
                Object.values(categories).map(async(item:any) =>{
                    return {
                       title:item.title
                    }
                })
            )
            await LayoutModel.findByIdAndUpdate(category?._id,{type:"Categories",categories:categoriesItem})

        }

        res.status(201).json({
            success:true,
            message:"Layout Updated Successfuly"
        })
        
    } catch (error: any) {
        return next(new ErrorHandler(error.message,500))
    }
})


// get layout by type

export const getLayoutByType = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {type} = req.body
        const layout = await LayoutModel.findOne({type})
        if(!layout){
            return next(new ErrorHandler("not Found",404))
        }
        return res.status(200).json({
            success:true,
            layout
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.message,500))
    }
})