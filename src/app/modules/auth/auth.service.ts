import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import { prisma } from "../../shared/prisma";
import config from "../../../config";
import {
  IRegisterTourist,
  IRegisterGuide,
  ILogin,
  IChangePassword,
  IRefreshToken,
  ITokens,
  IAuthUser,
} from "./auth.interface";
import { UserRole } from "@prisma/client";

// Helper function to generate JWT tokens
const generateTokens = (payload: IAuthUser): ITokens => {
  const accessToken = jwt.sign(
    payload,
    config.jwt_secret!,
    { expiresIn: config.jwt_expires_in as any }
  );

  const refreshToken = jwt.sign(
    payload,
    config.jwt_refresh_secret!,
    { expiresIn: config.jwt_refresh_expires_in as any }
  );

  return { accessToken, refreshToken };
};

// Register Tourist
const registerTourist = async (payload: IRegisterTourist) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_rounds
  );

  // Create user and tourist profile in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        role: UserRole.TOURIST,
      },
    });

    // Create tourist profile
    const tourist = await tx.tourist.create({
      data: {
        email: payload.email,
        name: payload.name,
        phoneNumber: payload.phoneNumber,
        nationality: payload.nationality,
        dateOfBirth: payload.dateOfBirth,
        bio: payload.bio,
      },
    });

    return { user, tourist };
  });

  // Generate tokens
  const tokenPayload: IAuthUser = {
    userId: result.user.id,
    email: result.user.email,
    role: result.user.role,
  };

  const tokens = generateTokens(tokenPayload);

  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    },
    tourist: result.tourist,
    ...tokens,
  };
};

// Register Guide
const registerGuide = async (payload: IRegisterGuide) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_rounds
  );

  // Create user and guide profile in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        role: UserRole.GUIDE,
      },
    });

    // Create guide profile
    const guide = await tx.guide.create({
      data: {
        email: payload.email,
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

    return { user, guide };
  });

  // Generate tokens
  const tokenPayload: IAuthUser = {
    userId: result.user.id,
    email: result.user.email,
    role: result.user.role,
  };

  const tokens = generateTokens(tokenPayload);

  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    },
    guide: result.guide,
    ...tokens,
  };
};

// Login
const login = async (payload: ILogin) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: {
      tourist: true,
      guide: true,
      admin: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if user is active
  if (user.status !== "ACTIVE") {
    throw new Error("Your account is inactive or suspended");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Generate tokens
  const tokenPayload: IAuthUser = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const tokens = generateTokens(tokenPayload);

  // Get role-specific profile
  let profile = null;
  if (user.role === UserRole.TOURIST && user.tourist) {
    profile = user.tourist;
  } else if (user.role === UserRole.GUIDE && user.guide) {
    profile = user.guide;
  } else if (user.role === UserRole.ADMIN && user.admin) {
    profile = user.admin;
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      needPasswordChange: user.needPasswordChange,
    },
    profile,
    ...tokens,
  };
};

// Refresh Token
const refreshToken = async (payload: IRefreshToken) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(
      payload.refreshToken,
      config.jwt_refresh_secret as string
    ) as IAuthUser;

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.status !== "ACTIVE") {
      throw new Error("Your account is inactive or suspended");
    }

    // Generate new tokens
    const tokenPayload: IAuthUser = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(tokenPayload);

    return tokens;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

// Change Password
const changePassword = async (userId: string, payload: IChangePassword) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify old password
  const isPasswordValid = await bcrypt.compare(
    payload.oldPassword,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Old password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    config.bcrypt_salt_rounds
  );

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return { message: "Password changed successfully" };
};

export const AuthService = {
  registerTourist,
  registerGuide,
  login,
  refreshToken,
  changePassword,
};
