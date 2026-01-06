import { z } from "zod";
import { TourCategory } from "@prisma/client";

const registerTouristSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    name: z.string({ required_error: "Name is required" }),
    phoneNumber: z.string().optional(),
    nationality: z.string().optional(),
    dateOfBirth: z.string().optional(),
    bio: z.string().optional(),
  }),
});

const registerGuideSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    name: z.string({ required_error: "Name is required" }),
    phoneNumber: z.string({ required_error: "Phone number is required" }),
    bio: z.string({ required_error: "Bio is required" }),
    languages: z.array(z.string()).min(1, "At least one language is required"),
    expertiseAreas: z.array(z.nativeEnum(TourCategory)).min(1, "At least one expertise area is required"),
    city: z.string({ required_error: "City is required" }),
    country: z.string({ required_error: "Country is required" }),
    pricePerHour: z.number({ required_error: "Price per hour is required" }).positive("Price must be positive"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
    password: z.string({ required_error: "Password is required" }),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: "Old password is required" }),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: "Refresh token is required" }),
  }),
});

export const AuthValidation = {
  registerTouristSchema,
  registerGuideSchema,
  loginSchema,
  changePasswordSchema,
  refreshTokenSchema,
};
