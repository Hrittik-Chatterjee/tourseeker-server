import express from "express";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";

const router = express.Router();

// Register routes
router.post(
  "/register/tourist",
  validateRequest(AuthValidation.registerTouristSchema),
  AuthController.registerTourist
);

router.post(
  "/register/guide",
  validateRequest(AuthValidation.registerGuideSchema),
  AuthController.registerGuide
);

// Login route
router.post(
  "/login",
  validateRequest(AuthValidation.loginSchema),
  AuthController.login
);

// Refresh token route
router.post(
  "/refresh-token",
  validateRequest(AuthValidation.refreshTokenSchema),
  AuthController.refreshToken
);

// Change password route (requires authentication)
router.post(
  "/change-password",
  auth(),
  validateRequest(AuthValidation.changePasswordSchema),
  AuthController.changePassword
);

export const AuthRoutes = router;
