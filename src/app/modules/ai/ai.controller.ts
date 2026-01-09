
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AIService } from "./ai.service";

const getRecommendations = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await AIService.generateRecommendations({
        touristId: user?.userId,
        preferences: req.body.preferences,
        history: req.body.history
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Recommendations generated successfully",
        data: result,
    });
});

const chatWithAI = catchAsync(async (req: Request, res: Response) => {
    const result = await AIService.chatWithAI(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "AI response received",
        data: result,
    });
});

const generateItinerary = catchAsync(async (req: Request, res: Response) => {
    const result = await AIService.generateItinerary(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Itinerary generated successfully",
        data: result,
    });
});

export const AIController = {
    getRecommendations,
    chatWithAI,
    generateItinerary
};
