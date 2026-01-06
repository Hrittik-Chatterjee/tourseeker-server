import { z } from "zod";
import { TourCategory } from "@prisma/client";

const updateTouristSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
    nationality: z.string().optional(),
    dateOfBirth: z.string().optional(),
    bio: z.string().optional(),
    preferences: z
      .object({
        categories: z.array(z.nativeEnum(TourCategory)).optional(),
        languages: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

const updateGuideSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
    bio: z.string().optional(),
    languages: z.array(z.string()).optional(),
    expertiseAreas: z.array(z.nativeEnum(TourCategory)).optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    pricePerHour: z.number().positive().optional(),
  }),
});

const updateAdminSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
});

export const UserValidation = {
  updateTouristSchema,
  updateGuideSchema,
  updateAdminSchema,
};
