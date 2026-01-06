import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import httpStatus from "http-status";

const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }
      next(error);
    }
  };
};

export default validateRequest;
