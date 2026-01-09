
import express from "express";
import { AIController } from "./ai.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
    "/recommendations",
    // Optional auth: auth(UserRole.TOURIST),
    AIController.getRecommendations
);

router.post(
    "/chat",
    AIController.chatWithAI
);

router.post(
    "/itinerary",
    AIController.generateItinerary
);

export const AIRoutes = router;
