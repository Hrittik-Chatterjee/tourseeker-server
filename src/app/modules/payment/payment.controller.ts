import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";

// Create payment (Tourist only)
const createPayment = catchAsync(async (req: Request, res: Response) => {
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

  const result = await PaymentService.createPayment(tourist.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Payment session created successfully",
    data: result,
  });
});

// Get payment by ID
const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  const result = await PaymentService.getPaymentById(id, user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment retrieved successfully",
    data: result,
  });
});

// Get my payments (Tourist or Guide)
const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;

  const result = await PaymentService.getMyPayments(
    user.userId,
    user.role,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Process refund (Guide or Admin)
const processRefund = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  const result = await PaymentService.processRefund(id, user.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment refunded successfully",
    data: result,
  });
});

// Stripe webhook handler
const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Missing stripe-signature header",
    });
  }

  await PaymentService.handleWebhook(signature, req.body);

  res.status(httpStatus.OK).json({ received: true });
});

export const PaymentController = {
  createPayment,
  getPaymentById,
  getMyPayments,
  processRefund,
  handleWebhook,
};
