
import express from "express";
import { AnalyticsController } from "./analytics.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
    "/dashboard",
    auth(UserRole.GUIDE),
    AnalyticsController.getDashboard
);

router.post(
    "/snapshot",
    auth(UserRole.GUIDE),
    AnalyticsController.generateSnapshot
);

export const AnalyticsRoutes = router;
