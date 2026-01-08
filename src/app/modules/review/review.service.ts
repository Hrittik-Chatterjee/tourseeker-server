import { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import {
  ICreateReview,
  IAddGuideResponse,
  IReviewFilters,
} from "./review.interface";

// Create review (Tourist only, for completed bookings)
const createReview = async (touristId: string, payload: ICreateReview) => {
  // Verify booking exists and is completed
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: {
      review: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.isDeleted) {
    throw new Error("Booking has been deleted");
  }

  // Verify booking belongs to this tourist
  if (booking.touristId !== touristId) {
    throw new Error("You are not authorized to review this booking");
  }

  // Verify booking is completed
  if (booking.status !== BookingStatus.COMPLETED) {
    throw new Error("Only completed bookings can be reviewed");
  }

  // Verify review doesn't already exist (only check non-deleted reviews)
  if (booking.review && !booking.review.isDeleted) {
    throw new Error("You have already reviewed this booking");
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      bookingId: payload.bookingId,
      touristId,
      guideId: booking.guideId,
      rating: payload.rating,
      comment: payload.comment,
    },
    include: {
      tourist: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      guide: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      booking: {
        select: {
          id: true,
          bookingDate: true,
          listing: {
            select: {
              id: true,
              title: true,
              images: true,
            },
          },
        },
      },
    },
  });

  // Update guide rating stats
  const guideReviews = await prisma.review.findMany({
    where: {
      guideId: booking.guideId,
      isDeleted: false,
    },
    select: {
      rating: true,
    },
  });

  const totalReviews = guideReviews.length;
  const rating =
    guideReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  await prisma.guide.update({
    where: { id: booking.guideId },
    data: {
      totalReviews,
      rating: Number(rating.toFixed(2)),
    },
  });

  return review;
};

// Get my reviews (Tourist only)
const getMyReviews = async (touristId: string, filters: IReviewFilters) => {
  const { page = 1, limit = 10, rating, sortBy = "createdAt", sortOrder = "desc" } = filters;

  // Build where clause
  const where: Prisma.ReviewWhereInput = {
    touristId,
    isDeleted: false,
  };

  if (rating) {
    where.rating = Number(rating);
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get reviews and total count
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        guide: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            city: true,
            country: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingDate: true,
            listing: {
              select: {
                id: true,
                title: true,
                images: true,
                city: true,
                country: true,
              },
            },
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data: reviews,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get reviews for a specific guide (Public)
const getGuideReviews = async (guideId: string, filters: IReviewFilters) => {
  const { page = 1, limit = 10, rating, sortBy = "createdAt", sortOrder = "desc" } = filters;

  // Verify guide exists
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
  });

  if (!guide) {
    throw new Error("Guide not found");
  }

  if (guide.isDeleted) {
    throw new Error("Guide profile has been deleted");
  }

  // Build where clause
  const where: Prisma.ReviewWhereInput = {
    guideId,
    isDeleted: false,
  };

  if (rating) {
    where.rating = Number(rating);
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get reviews and total count
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        tourist: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            nationality: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingDate: true,
            listing: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data: reviews,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get reviews for a specific listing (Public)
const getListingReviews = async (listingId: string, filters: IReviewFilters) => {
  const { page = 1, limit = 10, rating, sortBy = "createdAt", sortOrder = "desc" } = filters;

  // Verify listing exists
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.isDeleted) {
    throw new Error("Listing has been deleted");
  }

  // Build where clause - get reviews from bookings for this listing
  const where: Prisma.ReviewWhereInput = {
    booking: {
      listingId,
    },
    isDeleted: false,
  };

  if (rating) {
    where.rating = Number(rating);
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get reviews and total count
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        tourist: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            nationality: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingDate: true,
            numberOfPeople: true,
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data: reviews,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Add guide response to a review (Guide only)
const addGuideResponse = async (
  reviewId: string,
  guideId: string,
  payload: IAddGuideResponse
) => {
  // Find review and verify it's for this guide
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (review.isDeleted) {
    throw new Error("Review has been deleted");
  }

  if (review.guideId !== guideId) {
    throw new Error("You are not authorized to respond to this review");
  }

  // Update review with guide's response
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      response: payload.response,
    },
    include: {
      tourist: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        },
      },
      booking: {
        select: {
          id: true,
          bookingDate: true,
          listing: {
            select: {
              id: true,
              title: true,
              images: true,
            },
          },
        },
      },
    },
  });

  return updatedReview;
};

// Delete review (Tourist only - soft delete)
const deleteReview = async (reviewId: string, touristId: string) => {
  // Find review and verify it belongs to this tourist
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (review.isDeleted) {
    throw new Error("Review has already been deleted");
  }

  if (review.touristId !== touristId) {
    throw new Error("You are not authorized to delete this review");
  }

  // Soft delete review and update guide stats
  await prisma.$transaction(async (tx) => {
    // Soft delete review
    await tx.review.update({
      where: { id: reviewId },
      data: { isDeleted: true },
    });

    // Recalculate guide rating stats
    const guideReviews = await tx.review.findMany({
      where: {
        guideId: review.guideId,
        isDeleted: false,
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = guideReviews.length;
    const rating =
      totalReviews > 0
        ? guideReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    await tx.guide.update({
      where: { id: review.guideId },
      data: {
        totalReviews,
        rating: Number(rating.toFixed(2)),
      },
    });
  });

  return { message: "Review deleted successfully" };
};

export const ReviewService = {
  createReview,
  getMyReviews,
  getGuideReviews,
  getListingReviews,
  addGuideResponse,
  deleteReview,
};
