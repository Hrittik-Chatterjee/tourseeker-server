import express from "express";
import { ListingController } from "./listing.controller";
import { ListingValidation } from "./listing.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { upload } from "../../middlewares/multer";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Public routes
router.get(
  "/",
  validateRequest(ListingValidation.listingFiltersSchema),
  ListingController.getAllListings
);

router.get("/:id", ListingController.getListingById);

// Guide only routes
router.post(
  "/",
  auth(UserRole.GUIDE),
  validateRequest(ListingValidation.createListingSchema),
  ListingController.createListing
);

router.get(
  "/my/listings",
  auth(UserRole.GUIDE),
  ListingController.getMyListings
);

router.patch(
  "/:id",
  auth(UserRole.GUIDE),
  validateRequest(ListingValidation.updateListingSchema),
  ListingController.updateListing
);

router.delete("/:id", auth(UserRole.GUIDE), ListingController.deleteListing);

router.post(
  "/:id/images",
  auth(UserRole.GUIDE),
  upload.array("images", 10), // Max 10 images
  ListingController.uploadListingImages
);

export const ListingRoutes = router;
