
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AdminService } from "./admin.service";

const getSystemStats = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.getSystemStats();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "System stats retrieved successfully",
        data: result,
    });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.getAllUsers();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result,
    });
});

const blockUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.blockUser(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User blocked successfully",
        data: result,
    });
});

const verifyGuide = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.verifyGuide(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Guide verified successfully",
        data: result,
    });
});

export const AdminController = {
    getSystemStats,
    getAllUsers,
    blockUser,
    verifyGuide
};
