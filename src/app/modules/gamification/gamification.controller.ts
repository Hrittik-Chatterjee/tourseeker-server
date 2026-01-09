
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { GamificationService } from "./gamification.service";
import { AnalyticsPeriod } from "@prisma/client";

const checkAchievements = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await GamificationService.checkAchievements(user.userId, user.role);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: result.awardedBadges,
    });
});

const getMyBadges = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await GamificationService.getMyBadges(user.userId, user.role);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Badges retrieved successfully",
        data: result,
    });
});

const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
    const { period = 'MONTHLY', limit } = req.query;

    const result = await GamificationService.getLeaderboard({
        period: period as AnalyticsPeriod,
        limit: Number(limit)
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Leaderboard retrieved successfully",
        data: result,
    });
});


export const GamificationController = {
    checkAchievements,
    getMyBadges,
    getLeaderboard
};
