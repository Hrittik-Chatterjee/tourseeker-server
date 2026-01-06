import express from "express";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { upload } from "../../middlewares/multer";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Get my profile (authenticated)
router.get("/me", auth(), UserController.getMyProfile);

// Get user by ID (public)
router.get("/:id", UserController.getUserById);

// Update tourist profile
router.patch(
  "/tourist",
  auth(UserRole.TOURIST),
  validateRequest(UserValidation.updateTouristSchema),
  UserController.updateTouristProfile
);

// Update guide profile
router.patch(
  "/guide",
  auth(UserRole.GUIDE),
  validateRequest(UserValidation.updateGuideSchema),
  UserController.updateGuideProfile
);

// Update admin profile
router.patch(
  "/admin",
  auth(UserRole.ADMIN),
  validateRequest(UserValidation.updateAdminSchema),
  UserController.updateAdminProfile
);

// Upload profile photo
router.post(
  "/upload-photo",
  auth(),
  upload.single("profilePhoto"),
  UserController.uploadProfilePhoto
);

export const UserRoutes = router;
