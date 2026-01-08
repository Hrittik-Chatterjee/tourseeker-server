import express from "express";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Public routes (no auth required)
router.get(
  "/guide/:guideId",
  validateRequest(ReviewValidation.reviewFiltersSchema),
  ReviewController.getGuideReviews
);

router.get(
  "/listing/:listingId",
  validateRequest(ReviewValidation.reviewFiltersSchema),
  ReviewController.getListingReviews
);

// Tourist routes
router.post(
  "/",
  auth(UserRole.TOURIST),
  validateRequest(ReviewValidation.createReviewSchema),
  ReviewController.createReview
);

router.get(
  "/my",
  auth(UserRole.TOURIST),
  validateRequest(ReviewValidation.reviewFiltersSchema),
  ReviewController.getMyReviews
);

router.delete(
  "/:id",
  auth(UserRole.TOURIST),
  ReviewController.deleteReview
);

// Guide routes
router.patch(
  "/:id/response",
  auth(UserRole.GUIDE),
  validateRequest(ReviewValidation.addGuideResponseSchema),
  ReviewController.addGuideResponse
);

export const ReviewRoutes = router;
