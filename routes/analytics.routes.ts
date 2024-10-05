import express from "express";
import { authorizeRoles, isAuthinticated } from "../middlewares/auth";
import { getCourseAnalytics, getOrderAnalytics, getUserAnalytics } from "../controllers/analytics.controller";
const analyticsRouter = express.Router();


analyticsRouter.get('/user-analytics',isAuthinticated,authorizeRoles('admin'),getUserAnalytics)
analyticsRouter.get('/course-analytics',isAuthinticated,authorizeRoles('admin'),getCourseAnalytics)
analyticsRouter.get('/order-analytics',isAuthinticated,authorizeRoles('admin'),getOrderAnalytics)

export default analyticsRouter;
