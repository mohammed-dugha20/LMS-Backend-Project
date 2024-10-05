import express from "express";
import { authorizeRoles, isAuthinticated } from "../middlewares/auth";
import { createOrder, getAllOrder } from "../controllers/order.controller";
const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthinticated, createOrder);


orderRouter.get('/all-order',authorizeRoles('admin'),isAuthinticated,getAllOrder)
export default orderRouter;
