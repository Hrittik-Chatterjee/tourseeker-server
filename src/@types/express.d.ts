import { JwtPayload } from "jsonwebtoken";
import { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}
