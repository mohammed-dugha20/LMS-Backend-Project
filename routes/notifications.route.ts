import express from "express";
import { authorizeRoles, isAuthinticated } from "../middlewares/auth";
import { getNotifications, updateNotification } from "../controllers/notifications.controller";
const notificationRouter = express.Router();

notificationRouter.get("/notifications", authorizeRoles('admin'),isAuthinticated, getNotifications);
notificationRouter.put("/notifications/id",authorizeRoles('admin'),isAuthinticated,updateNotification)
export default notificationRouter;
