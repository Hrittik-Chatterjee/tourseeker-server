import express from "express";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Webhook endpoint (NO AUTH - Stripe sends webhooks)
// IMPORTANT: Raw body parsing is configured in app.ts for this route
router.post("/webhook", PaymentController.handleWebhook);

// Tourist routes
router.post(
  "/",
  auth(UserRole.TOURIST),
  validateRequest(PaymentValidation.createPaymentSchema),
  PaymentController.createPayment
);

router.get(
  "/my",
  auth(UserRole.TOURIST, UserRole.GUIDE),
  validateRequest(PaymentValidation.paymentFiltersSchema),
  PaymentController.getMyPayments
);

router.get(
  "/:id",
  auth(UserRole.TOURIST, UserRole.GUIDE),
  PaymentController.getPaymentById
);

// Guide/Admin routes
router.post(
  "/:id/refund",
  auth(UserRole.GUIDE, UserRole.ADMIN),
  validateRequest(PaymentValidation.processRefundSchema),
  PaymentController.processRefund
);

export const PaymentRoutes = router;
