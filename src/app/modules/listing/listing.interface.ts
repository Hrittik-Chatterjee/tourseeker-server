import { TourCategory } from "@prisma/client";

export interface ICreateListing {
  title: string;
  description: string;
  categories: TourCategory[];
  city: string;
  country: string;
  duration: number;
  maxGroupSize: number;
  pricePerPerson: number;
  includedItems: string[];
  languages: string[];
  meetingPoint: string;
  availableDays: string[];
}

export interface IUpdateListing {
  title?: string;
  description?: string;
  categories?: TourCategory[];
  city?: string;
  country?: string;
  duration?: number;
  maxGroupSize?: number;
  pricePerPerson?: number;
  includedItems?: string[];
  languages?: string[];
  meetingPoint?: string;
  availableDays?: string[];
  isActive?: boolean;
}

export interface IListingFilters {
  search?: string;
  category?: TourCategory;
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  language?: string;
  minDuration?: number;
  maxDuration?: number;
  page?: number;
  limit?: number;
  sortBy?: "price" | "duration" | "createdAt" | "viewCount";
  sortOrder?: "asc" | "desc";
}
