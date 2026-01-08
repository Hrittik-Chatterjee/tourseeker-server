import { z } from "zod";
import { PaymentStatus } from "@prisma/client";

const createPaymentSchema = z.object({
  body: z.object({
    bookingId: z
      .string({ required_error: "Booking ID is required" })
      .uuid("Invalid booking ID"),
    successUrl: z.string().url("Invalid success URL").optional(),
    cancelUrl: z.string().url("Invalid cancel URL").optional(),
  }),
});

const processRefundSchema = z.object({
  body: z.object({
    reason: z.string().min(10, "Reason must be at least 10 characters").optional(),
    amount: z.number().positive("Amount must be positive").optional(),
  }),
});

const paymentFiltersSchema = z.object({
  query: z.object({
    status: z.nativeEnum(PaymentStatus).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
});

export const PaymentValidation = {
  createPaymentSchema,
  processRefundSchema,
  paymentFiltersSchema,
};
