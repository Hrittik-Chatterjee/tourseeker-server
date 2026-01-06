import httpStatus from "http-status";
import { prisma } from "../../shared/prisma";
import { IUpdateTourist, IUpdateGuide, IUpdateAdmin } from "./user.interface";
import { UserRole } from "@prisma/client";
import { uploadToCloudinary } from "../../shared/cloudinary";

// Get user profile by ID (public view)
const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      tourist: true,
      guide: {
        include: {
          listings: {
            where: { isDeleted: false },
            select: {
              id: true,
              title: true,
              images: true,
              pricePerPerson: true,
              duration: true,
              city: true,
              country: true,
            },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              tourist: {
                select: {
                  name: true,
                  profilePhoto: true,
                },
              },
            },
          },
        },
      },
      admin: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === "DELETED") {
    throw new Error("User account has been deleted");
  }

  return user;
};

// Get own profile (authenticated user)
const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      needPasswordChange: true,
      createdAt: true,
      updatedAt: true,
      tourist: true,
      guide: {
        include: {
          listings: {
            where: { isDeleted: false },
          },
          bookings: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
      admin: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Update Tourist profile
const updateTouristProfile = async (
  userId: string,
  payload: IUpdateTourist
) => {
  // Get user email
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== UserRole.TOURIST) {
    throw new Error("User is not a tourist");
  }

  // Update tourist profile
  const updatedTourist = await prisma.tourist.update({
    where: { email: user.email },
    data: {
      name: payload.name,
      phoneNumber: payload.phoneNumber,
      nationality: payload.nationality,
      dateOfBirth: payload.dateOfBirth,
      bio: payload.bio,
      preferences: payload.preferences,
    },
  });

  return updatedTourist;
};

// Update Guide profile
const updateGuideProfile = async (userId: string, payload: IUpdateGuide) => {
  // Get user email
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== UserRole.GUIDE) {
    throw new Error("User is not a guide");
  }

  // Update guide profile
  const updatedGuide = await prisma.guide.update({
    where: { email: user.email },
    data: {
      name: payload.name,
      phoneNumber: payload.phoneNumber,
      bio: payload.bio,
      languages: payload.languages,
      expertiseAreas: payload.expertiseAreas,
      city: payload.city,
      country: payload.country,
      pricePerHour: payload.pricePerHour,
    },
  });

  return updatedGuide;
};

// Update Admin profile
const updateAdminProfile = async (userId: string, payload: IUpdateAdmin) => {
  // Get user email
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== UserRole.ADMIN) {
    throw new Error("User is not an admin");
  }

  // Update admin profile
  const updatedAdmin = await prisma.admin.update({
    where: { email: user.email },
    data: {
      name: payload.name,
      phoneNumber: payload.phoneNumber,
    },
  });

  return updatedAdmin;
};

// Upload profile photo
const uploadProfilePhoto = async (userId: string, file: any) => {
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tourist: true,
      guide: true,
      admin: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Upload to Cloudinary
  const uploadedImageUrl = await uploadToCloudinary(
    file.buffer,
    `profiles/${user.role.toLowerCase()}s`
  );

  // Update profile photo based on role
  if (user.role === UserRole.TOURIST && user.tourist) {
    await prisma.tourist.update({
      where: { email: user.email },
      data: { profilePhoto: uploadedImageUrl },
    });
  } else if (user.role === UserRole.GUIDE && user.guide) {
    await prisma.guide.update({
      where: { email: user.email },
      data: { profilePhoto: uploadedImageUrl },
    });
  } else if (user.role === UserRole.ADMIN && user.admin) {
    await prisma.admin.update({
      where: { email: user.email },
      data: { profilePhoto: uploadedImageUrl },
    });
  }

  return {
    profilePhoto: uploadedImageUrl,
  };
};

export const UserService = {
  getUserById,
  getMyProfile,
  updateTouristProfile,
  updateGuideProfile,
  updateAdminProfile,
  uploadProfilePhoto,
};
