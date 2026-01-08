import { z } from "zod";
import { BookingStatus } from "@prisma/client";

const createBookingSchema = z.object({
  body: z.object({
    listingId: z.string({ required_error: "Listing ID is required" }).uuid("Invalid listing ID"),
    bookingDate: z
      .string({ required_error: "Booking date is required" })
      .refine((date) => new Date(date) > new Date(), "Booking date must be in the future"),
    numberOfPeople: z
      .number({ required_error: "Number of people is required" })
      .int("Number of people must be an integer")
      .positive("Number of people must be positive"),
    specialRequests: z.string().optional(),
  }),
});

const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(BookingStatus, { required_error: "Status is required" }),
    cancellationReason: z.string().optional(),
  }).refine(
    (data) => {
      // If status is CANCELLED, cancellationReason should be provided
      if (data.status === BookingStatus.CANCELLED && !data.cancellationReason) {
        return false;
      }
      return true;
    },
    {
      message: "Cancellation reason is required when status is CANCELLED",
      path: ["cancellationReason"],
    }
  ),
});

const bookingFiltersSchema = z.object({
  query: z.object({
    status: z.nativeEnum(BookingStatus).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const BookingValidation = {
  createBookingSchema,
  updateBookingStatusSchema,
  bookingFiltersSchema,
};
