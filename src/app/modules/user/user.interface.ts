import { TourCategory } from "@prisma/client";

export interface IUpdateTourist {
  name?: string;
  phoneNumber?: string;
  nationality?: string;
  dateOfBirth?: Date;
  bio?: string;
  preferences?: {
    categories?: TourCategory[];
    languages?: string[];
  };
}

export interface IUpdateGuide {
  name?: string;
  phoneNumber?: string;
  bio?: string;
  languages?: string[];
  expertiseAreas?: TourCategory[];
  city?: string;
  country?: string;
  pricePerHour?: number;
}

export interface IUpdateAdmin {
  name?: string;
  phoneNumber?: string;
}

export interface IUploadPhoto {
  profilePhoto: string;
}
