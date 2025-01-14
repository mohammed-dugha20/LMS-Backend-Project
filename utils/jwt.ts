require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "./redis";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

  //parse environment variable to integrate with fallback values
  export const accessTokenExpire = parseInt(
    process.env.ACCESS_TOKEN_EXPIRE || "300",
    10
  );
  export const refreshTokenExpire = parseInt(
    process.env.REFRESH_TOKEN_EXPIRE || "1200",
    10
  );

  //option for cookies
  export const accessTokenOption: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
  };
  
  export const refreshTokenOption: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire *60*60*24* 1000),
    maxAge: refreshTokenExpire *60*60*24* 1000,
    httpOnly: true,
    sameSite: "lax",
  };


export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  // upload sessoin to redis
  redis.set(user._id, JSON.stringify(user) as any);

  // only set secures to true in production
  if (process.env.NODE_ENV === "production") accessTokenOption.secure = true;

  res.cookie("access_token", accessToken, accessTokenOption);
  res.cookie("refresh_token", refreshToken, refreshTokenOption);

  res.status(statusCode).json({
    success: true,
    data: user,
    token: accessToken,
  });
};
