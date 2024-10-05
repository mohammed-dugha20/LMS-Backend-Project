import express from "express";
import { authorizeRoles, isAuthinticated } from "../middlewares/auth";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layout.controller";
const layoutRouter = express.Router();

layoutRouter.post("/create-layout",isAuthinticated, authorizeRoles('admin') ,createLayout);
layoutRouter.put("/update-layout",isAuthinticated, authorizeRoles('admin') ,editLayout);
layoutRouter.get("/get-layout",isAuthinticated, authorizeRoles('admin') ,getLayoutByType);

export default layoutRouter;
