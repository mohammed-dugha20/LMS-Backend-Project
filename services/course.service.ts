import { Response } from "express";
import CourseModel from "../models/course.model";
import { CatchAsyncError } from "../middlewares/catchAsyncError";


// create Course
export const createCourse = CatchAsyncError(async(data:any,res:Response)=>{
    const course = await CourseModel.create(data);
    res.status(201).json({
        success:true,
        course: data
    });
})


export const getAllCoursesService = async (res: Response) => {
    const courses = await CourseModel.find().sort({createdAt:-1});
  
      return res.status(200).json({
        success: true,
        data: courses,
      });
    
  };


  export const deleteCourseService = async ( res: Response,id: string) => {

    const course = await CourseModel.findByIdAndDelete(id)
  
    return res.status(200).json({
      success: true,
      message:"Deleted Successfuly"
    });
  
  };  