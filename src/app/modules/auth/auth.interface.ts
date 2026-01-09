import { UserRole, TourCategory } from "@prisma/client";

export interface IRegisterTourist {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  nationality?: string;
  dateOfBirth?: Date;
  bio?: string;
}

export interface IRegisterGuide {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  bio: string;
  languages: string[];
  expertiseAreas: TourCategory[];
  city: string;
  country: string;
  pricePerHour: number;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface IRefreshToken {
  refreshToken: string;
}

export interface IAuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}
