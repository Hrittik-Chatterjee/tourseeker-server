import express from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRoutes } from "../modules/user/user.routes";
import { ListingRoutes } from "../modules/listing/listing.routes";
import { BookingRoutes } from "../modules/booking/booking.routes";
import { ReviewRoutes } from "../modules/review/review.routes";
import { PaymentRoutes } from "../modules/payment/payment.routes";
import { ChatRoutes } from "../modules/chat/chat.routes";
import { GamificationRoutes } from "../modules/gamification/gamification.routes";
import { AIRoutes } from "../modules/ai/ai.routes";
import { AnalyticsRoutes } from "../modules/analytics/analytics.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/listings",
    route: ListingRoutes,
  },
  {
    path: "/bookings",
    route: BookingRoutes,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },
  {
    path: "/payments",
    route: PaymentRoutes,
  },
  {
    path: "/chat",
    route: ChatRoutes,
  },
  {
    path: "/gamification",
    route: GamificationRoutes,
  },
  {
    path: "/ai",
    route: AIRoutes,
  },
  {
    path: "/analytics",
    route: AnalyticsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
