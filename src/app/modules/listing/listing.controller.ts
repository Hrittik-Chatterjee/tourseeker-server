import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ListingService } from "./listing.service";

// Create listing
const createListing = catchAsync(async (req: Request, res: Response) => {
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

  const result = await ListingService.createListing(guide.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Listing created successfully",
    data: result,
  });
});

// Get all listings with filters
const getAllListings = catchAsync(async (req: Request, res: Response) => {
  const result = await ListingService.getAllListings(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listings retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Get listing by ID
const getListingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ListingService.getListingById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing retrieved successfully",
    data: result,
  });
});

// Update listing
const updateListing = catchAsync(async (req: Request, res: Response) => {
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

  const result = await ListingService.updateListing(id, guide.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing updated successfully",
    data: result,
  });
});

// Delete listing
const deleteListing = catchAsync(async (req: Request, res: Response) => {
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

  const result = await ListingService.deleteListing(id, guide.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

// Upload listing images
const uploadListingImages = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "No files uploaded",
      data: null,
    });
  }

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

  const result = await ListingService.uploadListingImages(id, guide.id, files);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Images uploaded successfully",
    data: result,
  });
});

// Get my listings
const getMyListings = catchAsync(async (req: Request, res: Response) => {
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

  const result = await ListingService.getMyListings(guide.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My listings retrieved successfully",
    data: result,
  });
});

export const ListingController = {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  uploadListingImages,
  getMyListings,
};
