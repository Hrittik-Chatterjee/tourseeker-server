
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsPeriod } from "@prisma/client";

const getDashboard = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await AnalyticsService.getDashboard({
        guideId: user.profileId, // Assuming user object has profileId mapped
        period: req.query.period as 'DAILY' | 'WEEKLY' | 'MONTHLY'
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Dashboard data retrieved successfully",
        data: result,
    });
});

const generateSnapshot = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await AnalyticsService.generateSnapshot({
        guideId: user.profileId,
        period: (req.body.period as 'DAILY' | 'WEEKLY' | 'MONTHLY') || 'MONTHLY',
        date: req.body.date ? new Date(req.body.date) : undefined
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Snapshot generated successfully",
        data: result,
    });
});

export const AnalyticsController = {
    getDashboard,
    generateSnapshot
};
