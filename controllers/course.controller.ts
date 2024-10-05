import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, deleteCourseService } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import { getAllCoursesService } from "../services/course.service";
//upload course
export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_urlو,
        };
      }
      await createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//edit course
export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      const courseId = req.params.id;
      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        {
          new: true,
        }
      );

      return res.status(200).json({
        success: true,
        message: "course updated successfuly",
        data: course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get single course -- without purchasing
export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;

      const isCacheExist = await redis.get(courseId);

      if (isCacheExist) {
        const course = JSON.parse(isCacheExist);
        return res.status(200).json({
          success: true,
          message: "course returned successfuly From cache data",
          data: course,
        });
      } else {
        const course = await CourseModel.findById(courseId).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        await redis.set(courseId, JSON.stringify(course));
        if (!course) {
          return next(new ErrorHandler("course Not found", 404));
        }

        return res.status(200).json({
          success: true,
          message: "course returned successfuly",
          data: course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get all courses --without purchasing
export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCachedExist = await redis.get("allCourses");

      if (isCachedExist) {
        const courses = JSON.parse(isCachedExist);

        return res.status(200).json({
          success: true,
          message: "get All courses successfuly",
          data: courses,
        });
      } else {
        const courses = CourseModel.find().select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        await redis.set("allCourses", JSON.stringify(courses),"EX",604800);
        return res.status(200).json({
          success: true,
          message: "get All courses successfuly",
          data: courses,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get course contnent --only for valid user
export const getCourseContent = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user.courses;
      const courseId = req.params.id;

      const courseExist = userCourseList.find(
        (course: any) => course._id.toString() === courseId
      );

      if (!courseExist) {
        return next(
          new ErrorHandler("you are not aligable to reach this course", 404)
        );
      }

      const course = await CourseModel.findById(courseId);
      const content = course?.courseData;
      return res.status(200).json({
        success: true,
        message: "get course content successfuly",
        data: content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//add question in course
interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IAddQuestionData = req.body;

      const course = await CourseModel.findById(courseId);

      const courseContent = course?.courseData.find(
        (item: any) => item._id.toString() === contentId
      );

      if (!mongoose.Types.ObjectId.isValid(contentId) || !courseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      // create a new question object
      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      // add this question to our course content
      courseContent.questions.push(newQuestion);

      // save the updates course
      await course?.save();

      const notification = await NotificationModel.create({
        user: req.user?._id,
        title: "New Question Recived",
        message: `You have a new Question from ${courseContent?.title}`,
    });
      return res.status(200).json({
        success: true,
        message: "add question successfuly",
        data: course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add answer iin course question
interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}
export const answerQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, contentId, questionId }: IAddAnswerData =
        req.body;

      const course = await CourseModel.findById(courseId);

      const courseContent = course?.courseData.find(
        (item: any) => item._id.toString() === contentId
      );

      if (!mongoose.Types.ObjectId.isValid(contentId) || !courseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const question = courseContent.questions.find((item: any) => {
        item._id.equals(questionId);
      });

      if (!question) {
        return next(new ErrorHandler("Invlaid question id", 400));
      }

      // create new answer object
      const newAnswer: any = {
        user: req.user,
        answer,
      };
      question.questionReplies.push(newAnswer);

      await course?.save();

      if (req.user._id === question.user._id) {
        // create a notification
        const notification = await NotificationModel.create({
          user: req.user?._id,
          title: "New Quistion Reply Recived",
          message: `You have a new Order from ${courseContent?.title}`,
      });
      } else {
        const data = {
          name: question.user.name,
          title: courseContent.title,
        };

        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-replies.ejs"),
          data
        );

        try {
          await sendMail({
            email: question.user.email,
            subject: "Question Replies",
            template: "question-replies",
            data,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }

      return res.status(200).json({
        success: true,
        message: "question replies successfuly",
        data: course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add review in course
interface IAddReviewData {
  review: string;
  rating: number;
  userId: string;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user.courses;

      const courseId = req.params.id;

      // check course exist in userCourseList
      const courseExist = userCourseList.some(
        (course: any) => course._id.toString() === courseId.toString()
      );

      if (!courseExist) {
        return next(new ErrorHandler("not aligable to go this course", 500));
      }

      const course = await CourseModel.findById(courseId);
      const { review, rating } = req.body as IAddReviewData;
      const reviewData: any = {
        user: req.user,
        comment: review,
        rating: rating,
      };

      course?.reviews.push(reviewData);

      let avg = 0;
      course?.reviews.forEach((rev: any) => {
        avg += rev.rating;
      });

      if (course) {
        course.ratings = avg / course?.reviews.length;
      }

      await course?.save();

      const notification = {
        title: "new Review Recevied",
        message: `${req.user.name} has given a review on ${course?.name}`,
      };

      // create notification

      return res.status(200).json({
        success: true,
        message: "course review added successfuly",
        data: course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// replies in review
interface IAddReplyReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}
export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReplyReviewData;

      const course = await CourseModel.findById(courseId);
      if (!course) {
        return next(new ErrorHandler("course not found", 404));
      }

      const review = course.reviews.find(
        (rev: any) => rev._id.toString() === reviewId
      );

      if (!review) {
        return next(new ErrorHandler("review not found", 404));
      }

      const replyData: any = {
        user: req.user,
        comment: comment,
      };

      if (!review.commentReplice) {
        review.commentReplice = [];
      }
      review.commentReplice?.push(replyData);

      await course?.save();

      return res.status(200).json({
        success: true,
        message: "replies successfuly",
        data: course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


export const getAllCoursesAdmin = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
  try {
    getAllCoursesService(res)
  } catch (error: any) {
    return next(new ErrorHandler(error.message,400))
  }
})


export const deleteCourse = CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const {courseId} = req.params
    
    const course = await CourseModel.findById(courseId);

    if(!course){
      return next(new ErrorHandler("User Not Found",404))
    }

    await course.deleteOne({courseId})

    await redis.del(courseId)

    return res.status(200).json({
      success:true,
      message:"Course Deleted Successfuly"
    })
  } catch (error : any) {
    return next(new ErrorHandler(error.message,500))
  }
})