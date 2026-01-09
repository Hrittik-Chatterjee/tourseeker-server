import Stripe from "stripe";
import { BookingStatus, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import config from "../../../config";
import {
  ICreatePayment,
  IProcessRefund,
  IPaymentFilters,
} from "./payment.interface";

// Initialize Stripe
const stripe = new Stripe(config.stripe_secret_key as string, {
  apiVersion: "2025-02-24.acacia",
});

// Create payment session (Stripe Checkout)
const createPayment = async (touristId: string, payload: ICreatePayment) => {
  // Verify booking exists and belongs to tourist
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: {
      tourist: true,
      guide: true,
      listing: {
        select: {
          title: true,
          images: true,
        },
      },
      payment: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.touristId !== touristId) {
    throw new Error("You are not authorized to pay for this booking");
  }

  // Verify booking is accepted
  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new Error("Only accepted bookings can be paid for");
  }

  // Check if payment already exists
  if (booking.payment) {
    if (booking.payment.status === PaymentStatus.COMPLETED) {
      throw new Error("This booking has already been paid");
    }
    // If payment exists but not completed, return existing payment
    return booking.payment;
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: booking.listing.title,
            description: `Booking for ${booking.numberOfPeople} people`,
            images: booking.listing.images.slice(0, 1), // First image only
          },
          unit_amount: Math.round(booking.totalAmount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url:
      payload.successUrl ||
      `${config.frontend_url}/bookings/${booking.id}?payment=success`,
    cancel_url:
      payload.cancelUrl ||
      `${config.frontend_url}/bookings/${booking.id}?payment=cancelled`,
    customer_email: booking.tourist.email,
    metadata: {
      bookingId: booking.id,
      touristId: booking.touristId,
      guideId: booking.guideId,
    },
  });

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: booking.totalAmount,
      currency: "usd",
      stripeSessionId: session.id,
      status: PaymentStatus.PENDING,
    },
    include: {
      booking: {
        include: {
          tourist: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          guide: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              images: true,
            },
          },
        },
      },
    },
  });

  return {
    ...payment,
    checkoutUrl: session.url,
  };
};

// Get payment by ID
const getPaymentById = async (paymentId: string, userId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          tourist: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          guide: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              city: true,
              country: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  // Verify user has access (tourist or guide of the booking)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tourist: true,
      guide: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const canAccess =
    user.tourist?.id === payment.booking.touristId ||
    user.guide?.id === payment.booking.guideId;

  if (!canAccess) {
    throw new Error("You are not authorized to view this payment");
  }

  return payment;
};

// Get my payments (Tourist or Guide)
const getMyPayments = async (
  userId: string,
  role: string,
  filters: IPaymentFilters
) => {
  const {
    status,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = filters;

  // Get user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tourist: true,
      guide: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Build where clause
  const where: Prisma.PaymentWhereInput = {};

  if (role === "TOURIST" && user.tourist) {
    where.booking = {
      touristId: user.tourist.id,
    };
  } else if (role === "GUIDE" && user.guide) {
    where.booking = {
      guideId: user.guide.id,
    };
  }

  // Apply filters
  if (status) {
    where.status = status as PaymentStatus;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get payments and total count
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        booking: {
          include: {
            tourist: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            guide: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            listing: {
              select: {
                id: true,
                title: true,
                images: true,
                city: true,
                country: true,
              },
            },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    data: payments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Process refund (Guide or Admin)
const processRefund = async (
  paymentId: string,
  userId: string,
  payload: IProcessRefund
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          guide: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status === PaymentStatus.REFUNDED) {
    throw new Error("Payment has already been refunded");
  }

  if (payment.status !== PaymentStatus.COMPLETED) {
    throw new Error("Only completed payments can be refunded");
  }

  // Verify user is the guide or admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      guide: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "ADMIN" && user.guide?.id !== payment.booking.guideId) {
    throw new Error("You are not authorized to refund this payment");
  }

  // Calculate refund amount
  const refundAmount = payload.amount || payment.amount;

  if (refundAmount > payment.amount) {
    throw new Error("Refund amount cannot exceed payment amount");
  }

  // Process refund with Stripe
  if (!payment.stripePaymentId) {
    throw new Error("Payment intent ID not found");
  }

  const refund = await stripe.refunds.create({
    payment_intent: payment.stripePaymentId,
    amount: Math.round(refundAmount * 100), // Convert to cents
    reason: "requested_by_customer",
    metadata: {
      reason: payload.reason || "Refund requested",
    },
  });

  // Update payment record
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: PaymentStatus.REFUNDED,
      refundAmount,
      refundedAt: new Date(),
    },
    include: {
      booking: {
        include: {
          tourist: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          guide: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return {
    ...updatedPayment,
    stripeRefundId: refund.id,
  };
};

// Handle Stripe webhook events
const handleWebhook = async (
  signature: string,
  rawBody: Buffer
): Promise<void> => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe_webhook_secret as string
    );
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentSucceeded(paymentIntent);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentFailed(paymentIntent);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

// Handle checkout session completed
const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    console.error("No booking ID in session metadata");
    return;
  }

  // Update payment with payment intent ID
  await prisma.payment.update({
    where: { bookingId },
    data: {
      stripePaymentId: session.payment_intent as string,
    },
  });
};

// Handle payment intent succeeded
const handlePaymentIntentSucceeded = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  // Find payment by stripe payment intent ID
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: paymentIntent.id },
    include: {
      booking: true,
    },
  });

  if (!payment) {
    console.error("Payment not found for payment intent:", paymentIntent.id);
    return;
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.COMPLETED,
      paidAt: new Date(),
    },
  });

  // Update booking payment status
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: {
      paymentStatus: PaymentStatus.COMPLETED,
    },
  });
};

// Handle payment intent failed
const handlePaymentIntentFailed = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  // Find payment by stripe payment intent ID
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: paymentIntent.id },
  });

  if (!payment) {
    console.error("Payment not found for payment intent:", paymentIntent.id);
    return;
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.FAILED,
    },
  });

  // Update booking payment status
  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: {
      paymentStatus: PaymentStatus.FAILED,
    },
  });
};

export const PaymentService = {
  createPayment,
  getPaymentById,
  getMyPayments,
  processRefund,
  handleWebhook,
};
