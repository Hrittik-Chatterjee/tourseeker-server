
import express from "express";
import { UploadController } from "./upload.controller";
import { upload } from "../../../config/cloudinary.config";

const router = express.Router();

router.post(
    "/",
    upload.single('file'),
    UploadController.uploadImage
);

export const UploadRoutes = router;
