import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { BookingService } from "./booking.service";
import { prisma } from "../../shared/prisma";

// Create booking (Tourist only)
const createBooking = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  // Get tourist ID from user's email
  const tourist = await prisma.tourist.findUnique({
    where: { email: user.email }
  });

  if (!tourist) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Tourist profile not found",
      data: null,
    });
  }

  const result = await BookingService.createBooking(tourist.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

// Get my bookings (Tourist or Guide)
const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;

  // Get profile ID based on role
  const profile = user.role === "TOURIST"
    ? await prisma.tourist.findUnique({ where: { email: user.email } })
    : await prisma.guide.findUnique({ where: { email: user.email } });

  if (!profile) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Profile not found",
      data: null,
    });
  }

  const result = await BookingService.getMyBookings(profile.id, user.role, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Bookings retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Get booking by ID
const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const result = await BookingService.getBookingById(id, user.userId, user.role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking retrieved successfully",
    data: result,
  });
});

// Update booking status (Guide only)
const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // Get guide ID from user's email
  const guide = await prisma.guide.findUnique({
    where: { email: user.email }
  });

  if (!guide) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Guide profile not found",
      data: null,
    });
  }

  const result = await BookingService.updateBookingStatus(id, guide.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking status updated successfully",
    data: result,
  });
});

// Complete booking (Guide only)
const completeBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // Get guide ID from user's email
  const guide = await prisma.guide.findUnique({
    where: { email: user.email }
  });

  if (!guide) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Guide profile not found",
      data: null,
    });
  }

  const result = await BookingService.completeBooking(id, guide.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking marked as completed successfully",
    data: result,
  });
});

// Cancel booking (Tourist or Guide)
const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const { cancellationReason } = req.body;

  const result = await BookingService.cancelBooking(
    id,
    user.userId,
    user.role,
    cancellationReason
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.booking,
  });
});

// Get listing bookings (Guide only)
const getListingBookings = catchAsync(async (req: Request, res: Response) => {
  const { listingId } = req.params;
  const user = req.user!;

  // Get guide ID from user's email
  const guide = await prisma.guide.findUnique({
    where: { email: user.email }
  });

  if (!guide) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: "Guide profile not found",
      data: null,
    });
  }

  const result = await BookingService.getListingBookings(listingId, guide.id, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing bookings retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const BookingController = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  completeBooking,
  cancelBooking,
  getListingBookings,
};
