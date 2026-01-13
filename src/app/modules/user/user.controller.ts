import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserService } from "./user.service";

// Get user by ID (public)
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getUserById(String(id));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

// Get my profile (authenticated)
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await UserService.getMyProfile(user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});

// Update tourist profile
const updateTouristProfile = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await UserService.updateTouristProfile(user.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tourist profile updated successfully",
    data: result,
  });
});

// Update guide profile
const updateGuideProfile = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await UserService.updateGuideProfile(user.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Guide profile updated successfully",
    data: result,
  });
});

// Update admin profile
const updateAdminProfile = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await UserService.updateAdminProfile(user.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin profile updated successfully",
    data: result,
  });
});

// Upload profile photo
const uploadProfilePhoto = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const file = req.file;

  if (!file) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "No file uploaded",
      data: null,
    });
  }

  const result = await UserService.uploadProfilePhoto(user.userId, file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile photo uploaded successfully",
    data: result,
  });
});

export const UserController = {
  getUserById,
  getMyProfile,
  updateTouristProfile,
  updateGuideProfile,
  updateAdminProfile,
  uploadProfilePhoto,
};
