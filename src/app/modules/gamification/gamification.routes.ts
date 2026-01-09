
import express from "express";
import { GamificationController } from "./gamification.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Get My Badges
router.get(
    "/my-badges",
    auth(UserRole.TOURIST, UserRole.GUIDE),
    GamificationController.getMyBadges
);

// Check Achievements (Manual Trigger)
router.post(
    "/check-achievements",
    auth(UserRole.TOURIST, UserRole.GUIDE),
    GamificationController.checkAchievements
);

// Get Leaderboard
router.get(
    "/leaderboard",
    GamificationController.getLeaderboard
);

export const GamificationRoutes = router;
