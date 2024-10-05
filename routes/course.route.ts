import express, { Router } from "express";
import { addQuestion, addReplyToReview, addReview, answerQuestion, deleteCourse, editCourse, getAllCourses, getAllCoursesAdmin, getCourseContent, getSingleCourse, uploadCourse } from "../controllers/course.controller";
import { authorizeRoles, isAuthinticated } from "../middlewares/auth";

const courseRouter = Router();

courseRouter.post(
  "/create-course",
  isAuthinticated,
  authorizeRoles("admin"),
  uploadCourse
);

courseRouter.put(
  "/update-course/:id",
  isAuthinticated,
  authorizeRoles("admin"),
  editCourse
);

courseRouter.get(
  '/course/:id',
  getSingleCourse
)
courseRouter.get(
  '/courses',
  getAllCourses
);
courseRouter.get(
  '/get-course-content/:id',
  isAuthinticated,
  getCourseContent
);
courseRouter.put(
  '/add-question',
  isAuthinticated,
  addQuestion
);
courseRouter.put(
  '/add-answer',
  isAuthinticated,
  answerQuestion
);
courseRouter.put(
  '/add-review/:id',
  isAuthinticated,
  addReview
);
courseRouter.put(
  '/add-reply-review',
  isAuthinticated,
  authorizeRoles('admin'),
  addReplyToReview
);



courseRouter.get('/all-Courses',authorizeRoles('admin'),isAuthinticated,getAllCoursesAdmin)
courseRouter.delete('/delete-course/:courseId',authorizeRoles('admin'),isAuthinticated,deleteCourse)


export default courseRouter;
