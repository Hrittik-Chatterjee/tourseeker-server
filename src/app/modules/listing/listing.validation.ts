import { z } from "zod";
import { TourCategory } from "@prisma/client";

const createListingSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Title is required" }).min(5, "Title must be at least 5 characters"),
    description: z.string({ required_error: "Description is required" }).min(20, "Description must be at least 20 characters"),
    categories: z.array(z.nativeEnum(TourCategory)).min(1, "At least one category is required"),
    city: z.string({ required_error: "City is required" }),
    country: z.string({ required_error: "Country is required" }),
    duration: z.number({ required_error: "Duration is required" }).positive("Duration must be positive"),
    maxGroupSize: z.number({ required_error: "Max group size is required" }).int().positive("Max group size must be a positive integer"),
    pricePerPerson: z.number({ required_error: "Price per person is required" }).positive("Price must be positive"),
    includedItems: z.array(z.string()).min(1, "At least one included item is required"),
    languages: z.array(z.string()).min(1, "At least one language is required"),
    meetingPoint: z.string({ required_error: "Meeting point is required" }),
    availableDays: z.array(z.string()).min(1, "At least one available day is required"),
  }),
});

const updateListingSchema = z.object({
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters").optional(),
    description: z.string().min(20, "Description must be at least 20 characters").optional(),
    categories: z.array(z.nativeEnum(TourCategory)).min(1).optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    duration: z.number().positive().optional(),
    maxGroupSize: z.number().int().positive().optional(),
    pricePerPerson: z.number().positive().optional(),
    includedItems: z.array(z.string()).min(1).optional(),
    languages: z.array(z.string()).min(1).optional(),
    meetingPoint: z.string().optional(),
    availableDays: z.array(z.string()).min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

const listingFiltersSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.nativeEnum(TourCategory).optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    minPrice: z.string().transform(Number).optional(),
    maxPrice: z.string().transform(Number).optional(),
    language: z.string().optional(),
    minDuration: z.string().transform(Number).optional(),
    maxDuration: z.string().transform(Number).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    sortBy: z.enum(["price", "duration", "createdAt", "viewCount"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const ListingValidation = {
  createListingSchema,
  updateListingSchema,
  listingFiltersSchema,
};
