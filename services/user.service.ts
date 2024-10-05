import { Response } from "express";
import { redis } from "../utils/redis";
import userModel from "../models/user.model";

//get user by id
export const getUserById = async (id: string, res: Response) => {
  const userJson = await redis.get(id);
  if (userJson) {
    const user = JSON.parse(userJson);
    return res.status(200).json({
      success: true,
      data: user,
    });
  }
};

export const getAllUsersService = async (res: Response) => {
  const users = await userModel.find().sort({createdAt:-1});

    return res.status(200).json({
      success: true,
      data: users,
    });
  
};


export const updateUserRoleService = async ( res: Response,id: string, role: string) => {

    const user = await userModel.findByIdAndUpdate(id,{ role }, {new:true})

    return res.status(200).json({
      success: true,
      data: user,
    });
  
};


export const deleteUserService = async ( res: Response,id: string) => {

  const user = await userModel.findByIdAndDelete(id)

  return res.status(200).json({
    success: true,
    message:"Deleted Successfuly"
  });

};
