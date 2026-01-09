
import express from "express";
import { AdminController } from "./admin.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// All routes require ADMIN role
router.use(auth(UserRole.ADMIN));

router.get("/stats", AdminController.getSystemStats);
router.get("/users", AdminController.getAllUsers);
router.patch("/users/:id/block", AdminController.blockUser);
router.patch("/guides/:id/verify", AdminController.verifyGuide);

export const AdminRoutes = router;
