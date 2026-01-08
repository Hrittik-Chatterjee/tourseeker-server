import express from "express";
import { BookingController } from "./booking.controller";
import { BookingValidation } from "./booking.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Tourist routes
router.post(
  "/",
  auth(UserRole.TOURIST),
  validateRequest(BookingValidation.createBookingSchema),
  BookingController.createBooking
);

// Shared routes (Tourist or Guide)
router.get(
  "/my",
  auth(UserRole.TOURIST, UserRole.GUIDE),
  validateRequest(BookingValidation.bookingFiltersSchema),
  BookingController.getMyBookings
);

router.get(
  "/:id",
  auth(UserRole.TOURIST, UserRole.GUIDE),
  BookingController.getBookingById
);

router.delete(
  "/:id",
  auth(UserRole.TOURIST, UserRole.GUIDE),
  BookingController.cancelBooking
);

// Guide routes
router.patch(
  "/:id/status",
  auth(UserRole.GUIDE),
  validateRequest(BookingValidation.updateBookingStatusSchema),
  BookingController.updateBookingStatus
);

router.patch(
  "/:id/complete",
  auth(UserRole.GUIDE),
  BookingController.completeBooking
);

router.get(
  "/listing/:listingId",
  auth(UserRole.GUIDE),
  validateRequest(BookingValidation.bookingFiltersSchema),
  BookingController.getListingBookings
);

export const BookingRoutes = router;
