import express from "express";

const router = express.Router();

const moduleRoutes = [
  // Add module routes here as we create them
  // Example:
  // {
  //   path: "/auth",
  //   route: authRoutes,
  // },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
