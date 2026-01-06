import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import config from "../../config";
import { prisma } from "../shared/prisma";

interface CustomRequest extends Request {
  user?: JwtPayload;
}

const auth = (...roles: string[]) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: "You are not authorized",
        });
      }

      const verifiedToken = jwt.verify(
        token,
        config.jwt_secret as string
      ) as JwtPayload;

      req.user = verifiedToken;

      // Check if user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: verifiedToken.userId },
      });

      if (!user) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.status !== "ACTIVE") {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: "Your account is inactive",
        });
      }

      // Check role authorization
      if (roles.length && !roles.includes(verifiedToken.role)) {
        return res.status(httpStatus.FORBIDDEN).json({
          success: false,
          message: "You don't have permission to access this resource",
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
