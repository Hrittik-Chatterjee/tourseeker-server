import { z } from "zod";

const createReviewSchema = z.object({
  body: z.object({
    bookingId: z
      .string({ required_error: "Booking ID is required" })
      .uuid("Invalid booking ID"),
    rating: z
      .number({ required_error: "Rating is required" })
      .int("Rating must be an integer")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
    comment: z
      .string({ required_error: "Comment is required" })
      .min(10, "Comment must be at least 10 characters")
      .max(1000, "Comment must be at most 1000 characters"),
  }),
});

const addGuideResponseSchema = z.object({
  body: z.object({
    response: z
      .string({ required_error: "Response is required" })
      .min(10, "Response must be at least 10 characters")
      .max(1000, "Response must be at most 1000 characters"),
  }),
});

const reviewFiltersSchema = z.object({
  query: z.object({
    rating: z.string().transform(Number).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    sortBy: z.enum(["createdAt", "rating"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const ReviewValidation = {
  createReviewSchema,
  addGuideResponseSchema,
  reviewFiltersSchema,
};
