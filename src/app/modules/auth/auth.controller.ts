import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";

// Register Tourist
const registerTourist = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerTourist(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Tourist registered successfully",
    data: result,
  });
});

// Register Guide
const registerGuide = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerGuide(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Guide registered successfully",
    data: result,
  });
});

// Login
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: result,
  });
});

// Refresh Token
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.refreshToken(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Token refreshed successfully",
    data: result,
  });
});

// Change Password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await AuthService.changePassword(user.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const AuthController = {
  registerTourist,
  registerGuide,
  login,
  refreshToken,
  changePassword,
};
