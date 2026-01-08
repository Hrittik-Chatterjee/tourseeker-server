import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ReviewService } from "./review.service";

// Create review (Tourist only)
const createReview = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;

  // Get tourist ID from user's email
  const tourist = await import("../../shared/prisma").then((m) =>
    m.prisma.tourist.findUnique({ where: { email: user.email } })
  );

  if (!tourist) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Tourist profile not found",
      data: null,
    });
  }

  const result = await ReviewService.createReview(tourist.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

// Get my reviews (Tourist only)
const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;

  // Get tourist ID from user's email
  const tourist = await import("../../shared/prisma").then((m) =>
    m.prisma.tourist.findUnique({ where: { email: user.email } })
  );

  if (!tourist) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Tourist profile not found",
      data: null,
    });
  }

  const result = await ReviewService.getMyReviews(tourist.id, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Get reviews for a guide (Public)
const getGuideReviews = catchAsync(async (req: Request, res: Response) => {
  const { guideId } = req.params;

  const result = await ReviewService.getGuideReviews(guideId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Guide reviews retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Get reviews for a listing (Public)
const getListingReviews = catchAsync(async (req: Request, res: Response) => {
  const { listingId } = req.params;

  const result = await ReviewService.getListingReviews(listingId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing reviews retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Add guide response to review (Guide only)
const addGuideResponse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  // Get guide ID from user's email
  const guide = await import("../../shared/prisma").then((m) =>
    m.prisma.guide.findUnique({ where: { email: user.email } })
  );

  if (!guide) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Guide profile not found",
      data: null,
    });
  }

  const result = await ReviewService.addGuideResponse(id, guide.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Response added successfully",
    data: result,
  });
});

// Delete review (Tourist only)
const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  // Get tourist ID from user's email
  const tourist = await import("../../shared/prisma").then((m) =>
    m.prisma.tourist.findUnique({ where: { email: user.email } })
  );

  if (!tourist) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Tourist profile not found",
      data: null,
    });
  }

  const result = await ReviewService.deleteReview(id, tourist.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

export const ReviewController = {
  createReview,
  getMyReviews,
  getGuideReviews,
  getListingReviews,
  addGuideResponse,
  deleteReview,
};
