
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { cloudinaryInstance } from "../../../config/cloudinary.config";

const uploadImage = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new Error('No file uploaded');
    }

    // Upload stream
    const runUpload = () => {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinaryInstance.uploader.upload_stream(
                {
                    folder: 'tourseeker',
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            // Pipe buffer to stream
            uploadStream.end(req.file!.buffer);
        });
    };

    const result: any = await runUpload();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Image uploaded successfully",
        data: {
            url: result.secure_url
        },
    });
});

export const UploadController = {
    uploadImage,
};
