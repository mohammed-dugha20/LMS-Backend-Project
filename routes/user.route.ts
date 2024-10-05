import express, { Router } from "express";
import {
  activateUser,
  deleteUser,
  getAllUsers,
  getUserInfo,
  loginUser,
  logoutUser,
  registerationUser,
  socialAuth,
  updateAccessToken,
  updateProfilePicture,
  updateUserInfo,
  updateUserPassword,
  updateUserRole,
} from "../controllers/user.controller";
import { authorizeRoles, isAuthinticated } from "../middlewares/auth";
const UserRouter = Router();

UserRouter.post("/register", registerationUser);
UserRouter.post("/activate-user", activateUser);
UserRouter.post("/login", loginUser);
UserRouter.post("/social-auth", socialAuth);

UserRouter.get("/logout", isAuthinticated, logoutUser);
UserRouter.get("/refresh-token", updateAccessToken);
UserRouter.get("/me", isAuthinticated, getUserInfo);

UserRouter.put("/update-user-info", isAuthinticated, updateUserInfo);
UserRouter.put("/update-password", isAuthinticated, updateUserPassword);
UserRouter.put("/update-user-avatar",isAuthinticated,updateProfilePicture);

UserRouter.get('/all-users',authorizeRoles('admin'),isAuthinticated,getAllUsers)


UserRouter.put('/update-user-role',authorizeRoles('admin'),isAuthinticated,updateUserRole)

UserRouter.delete('/delete-user/:userId',authorizeRoles('admin'),isAuthinticated,deleteUser)

export default UserRouter;
