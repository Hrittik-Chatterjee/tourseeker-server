import { Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import {
  ICreateListing,
  IUpdateListing,
  IListingFilters,
} from "./listing.interface";
import { uploadToCloudinary } from "../../shared/cloudinary";

// Create listing (Guide only)
const createListing = async (guideId: string, payload: ICreateListing) => {
  // Verify guide exists
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
  });

  if (!guide) {
    throw new Error("Guide not found");
  }

  if (guide.isDeleted) {
    throw new Error("Guide account is deleted");
  }

  // Create listing
  const listing = await prisma.listing.create({
    data: {
      guideId,
      ...payload,
      images: [], // Images will be added separately
    },
    include: {
      guide: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          rating: true,
          totalReviews: true,
        },
      },
    },
  });

  return listing;
};

// Get all listings with filters and pagination
const getAllListings = async (filters: IListingFilters) => {
  const {
    search,
    category,
    city,
    country,
    minPrice: minPriceRaw,
    maxPrice: maxPriceRaw,
    language,
    minDuration: minDurationRaw,
    maxDuration: maxDurationRaw,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  // Convert string numbers to actual numbers
  const minPrice = minPriceRaw ? Number(minPriceRaw) : undefined;
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;
  const minDuration = minDurationRaw ? Number(minDurationRaw) : undefined;
  const maxDuration = maxDurationRaw ? Number(maxDurationRaw) : undefined;

  // Build where clause
  const where: Prisma.ListingWhereInput = {
    isDeleted: false,
    isActive: true,
  };

  // Search in title and description
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Category filter
  if (category) {
    where.categories = {
      has: category,
    };
  }

  // Location filters
  if (city) {
    where.city = { contains: city, mode: "insensitive" };
  }

  if (country) {
    where.country = { contains: country, mode: "insensitive" };
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.pricePerPerson = {};
    if (minPrice !== undefined) {
      where.pricePerPerson.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.pricePerPerson.lte = maxPrice;
    }
  }

  // Duration range filter
  if (minDuration !== undefined || maxDuration !== undefined) {
    where.duration = {};
    if (minDuration !== undefined) {
      where.duration.gte = minDuration;
    }
    if (maxDuration !== undefined) {
      where.duration.lte = maxDuration;
    }
  }

  // Language filter
  if (language) {
    where.languages = {
      has: language,
    };
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Build order by
  const orderBy: Prisma.ListingOrderByWithRelationInput = {};
  if (sortBy === "price") {
    orderBy.pricePerPerson = sortOrder;
  } else if (sortBy === "duration") {
    orderBy.duration = sortOrder;
  } else if (sortBy === "viewCount") {
    orderBy.viewCount = sortOrder;
  } else {
    orderBy.createdAt = sortOrder;
  }

  // Get listings and total count
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        guide: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
            totalReviews: true,
            city: true,
            country: true,
          },
        },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    data: listings,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get listing by ID
const getListingById = async (listingId: string) => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      guide: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          bio: true,
          languages: true,
          rating: true,
          totalReviews: true,
          totalBookings: true,
          city: true,
          country: true,
          pricePerHour: true,
          isVerified: true,
        },
      },
      bookings: {
        where: {
          status: "COMPLETED",
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.isDeleted) {
    throw new Error("Listing has been deleted");
  }

  // Increment view count
  await prisma.listing.update({
    where: { id: listingId },
    data: { viewCount: { increment: 1 } },
  });

  return listing;
};

// Update listing (Owner only)
const updateListing = async (
  listingId: string,
  guideId: string,
  payload: IUpdateListing
) => {
  // Check if listing exists and belongs to guide
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.isDeleted) {
    throw new Error("Listing has been deleted");
  }

  if (listing.guideId !== guideId) {
    throw new Error("You are not authorized to update this listing");
  }

  // Update listing
  const updatedListing = await prisma.listing.update({
    where: { id: listingId },
    data: payload,
    include: {
      guide: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          rating: true,
          totalReviews: true,
        },
      },
    },
  });

  return updatedListing;
};

// Delete listing (Owner only) - Soft delete
const deleteListing = async (listingId: string, guideId: string) => {
  // Check if listing exists and belongs to guide
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.isDeleted) {
    throw new Error("Listing has already been deleted");
  }

  if (listing.guideId !== guideId) {
    throw new Error("You are not authorized to delete this listing");
  }

  // Soft delete
  await prisma.listing.update({
    where: { id: listingId },
    data: { isDeleted: true },
  });

  return { message: "Listing deleted successfully" };
};

// Upload images for listing
const uploadListingImages = async (
  listingId: string,
  guideId: string,
  files: Express.Multer.File[]
) => {
  // Check if listing exists and belongs to guide
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.guideId !== guideId) {
    throw new Error("You are not authorized to upload images for this listing");
  }

  // Upload images to Cloudinary
  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file.buffer, `listings/${listingId}`)
  );

  const imageUrls = await Promise.all(uploadPromises);

  // Update listing with new images
  const updatedListing = await prisma.listing.update({
    where: { id: listingId },
    data: {
      images: {
        push: imageUrls,
      },
    },
  });

  return {
    images: updatedListing.images,
  };
};

// Get guide's own listings
const getMyListings = async (guideId: string) => {
  const listings = await prisma.listing.findMany({
    where: {
      guideId,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      bookings: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  return listings;
};

export const ListingService = {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  uploadListingImages,
  getMyListings,
};
