import { BookingStatus, Prisma, UserRole } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import {
  ICreateBooking,
  IUpdateBookingStatus,
  IBookingFilters,
} from "./booking.interface";

// Create booking (Tourist only)
const createBooking = async (touristId: string, payload: ICreateBooking) => {
  // Verify listing exists and is active
  const listing = await prisma.listing.findUnique({
    where: { id: payload.listingId },
    include: {
      guide: true,
    },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.isDeleted || !listing.isActive) {
    throw new Error("Listing is not available");
  }

  // Verify guide exists and is active
  if (listing.guide.isDeleted) {
    throw new Error("Guide is not available");
  }

  // Verify booking date is in the future
  if (new Date(payload.bookingDate) <= new Date()) {
    throw new Error("Booking date must be in the future");
  }

  // Verify numberOfPeople is within listing's maxGroupSize
  if (payload.numberOfPeople > listing.maxGroupSize) {
    throw new Error(
      `Number of people exceeds maximum group size of ${listing.maxGroupSize}`
    );
  }

  // Calculate total amount
  const totalAmount = listing.pricePerPerson * payload.numberOfPeople;

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      touristId,
      guideId: listing.guideId,
      listingId: payload.listingId,
      bookingDate: new Date(payload.bookingDate),
      numberOfPeople: payload.numberOfPeople,
      totalAmount,
      specialRequests: payload.specialRequests,
      status: BookingStatus.PENDING,
      paymentStatus: "PENDING",
    },
    include: {
      tourist: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          phoneNumber: true,
        },
      },
      guide: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          phoneNumber: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          images: true,
          city: true,
          country: true,
          duration: true,
          pricePerPerson: true,
          meetingPoint: true,
        },
      },
    },
  });

  return booking;
};

// Get my bookings (Tourist or Guide)
const getMyBookings = async (
  profileId: string,
  role: UserRole,
  filters: IBookingFilters
) => {
  const {
    status,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = filters;

  // Build where clause based on role
  const where: Prisma.BookingWhereInput = {
    isDeleted: false,
  };

  if (role === UserRole.TOURIST) {
    where.touristId = profileId;
  } else if (role === UserRole.GUIDE) {
    where.guideId = profileId;
  }

  // Apply filters
  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.bookingDate = {};
    if (startDate) {
      where.bookingDate.gte = new Date(startDate);
    }
    if (endDate) {
      where.bookingDate.lte = new Date(endDate);
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get bookings and total count
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        bookingDate: "desc",
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
            city: true,
            country: true,
            duration: true,
            pricePerPerson: true,
            meetingPoint: true,
          },
        },
        tourist: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            phoneNumber: true,
          },
        },
        guide: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            phoneNumber: true,
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
          },
        },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    data: bookings,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get booking by ID
const getBookingById = async (
  bookingId: string,
  userId: string,
  role: UserRole
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tourist: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          phoneNumber: true,
          nationality: true,
        },
      },
      guide: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          phoneNumber: true,
          bio: true,
          languages: true,
          city: true,
          country: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          description: true,
          images: true,
          city: true,
          country: true,
          duration: true,
          pricePerPerson: true,
          meetingPoint: true,
          categories: true,
        },
      },
      payment: true,
      review: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.isDeleted) {
    throw new Error("Booking has been deleted");
  }

  // Verify user has access to this booking
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tourist: true,
      guide: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const canAccess =
    (role === UserRole.TOURIST && user.tourist?.id === booking.touristId) ||
    (role === UserRole.GUIDE && user.guide?.id === booking.guideId);

  if (!canAccess) {
    throw new Error("You are not authorized to view this booking");
  }

  return booking;
};

// Update booking status (Guide only)
const updateBookingStatus = async (
  bookingId: string,
  guideId: string,
  payload: IUpdateBookingStatus
) => {
  // Find booking and verify guide owns it
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.isDeleted) {
    throw new Error("Booking has been deleted");
  }

  if (booking.guideId !== guideId) {
    throw new Error("You are not authorized to update this booking");
  }

  // Verify current status is PENDING
  if (booking.status !== BookingStatus.PENDING) {
    throw new Error("Only pending bookings can be accepted or declined");
  }

  // Verify new status is ACCEPTED or DECLINED
  if (
    payload.status !== BookingStatus.ACCEPTED &&
    payload.status !== BookingStatus.DECLINED
  ) {
    throw new Error("Invalid status. Can only accept or decline pending bookings");
  }

  // Update booking status
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: payload.status,
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
  });

  return updatedBooking;
};

// Complete booking (marks as completed and updates stats)
const completeBooking = async (bookingId: string, guideId: string) => {
  // Find booking and verify guide owns it
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.guideId !== guideId) {
    throw new Error("You are not authorized to complete this booking");
  }

  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new Error("Only accepted bookings can be marked as completed");
  }

  // Use transaction to update booking and stats atomically
  const result = await prisma.$transaction([
    // Update booking status
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.COMPLETED },
    }),
    // Update guide stats
    prisma.guide.update({
      where: { id: booking.guideId },
      data: {
        totalBookings: { increment: 1 },
        totalRevenue: { increment: booking.totalAmount },
      },
    }),
    // Update tourist stats
    prisma.tourist.update({
      where: { id: booking.touristId },
      data: {
        totalToursBooked: { increment: 1 },
      },
    }),
  ]);

  return result[0]; // Return the updated booking
};

// Cancel booking (Tourist or Guide)
const cancelBooking = async (
  bookingId: string,
  userId: string,
  role: UserRole,
  cancellationReason?: string
) => {
  // Find booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.isDeleted) {
    throw new Error("Booking has already been deleted");
  }

  // Verify booking is not completed
  if (booking.status === BookingStatus.COMPLETED) {
    throw new Error("Completed bookings cannot be cancelled");
  }

  // Verify booking is not already cancelled or declined
  if (
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.DECLINED
  ) {
    throw new Error("Booking has already been cancelled or declined");
  }

  // Verify user owns the booking
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tourist: true,
      guide: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const canCancel =
    (role === UserRole.TOURIST && user.tourist?.id === booking.touristId) ||
    (role === UserRole.GUIDE && user.guide?.id === booking.guideId);

  if (!canCancel) {
    throw new Error("You are not authorized to cancel this booking");
  }

  // Update booking to cancelled
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CANCELLED,
      cancellationReason,
    },
  });

  return {
    message: "Booking cancelled successfully",
    booking: updatedBooking,
  };
};

// Get bookings for a specific listing (Guide only)
const getListingBookings = async (
  listingId: string,
  guideId: string,
  filters: IBookingFilters
) => {
  // Verify guide owns the listing
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.guideId !== guideId) {
    throw new Error("You are not authorized to view bookings for this listing");
  }

  const { status, startDate, endDate, page = 1, limit = 10 } = filters;

  // Build where clause
  const where: Prisma.BookingWhereInput = {
    listingId,
    isDeleted: false,
  };

  // Apply filters
  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.bookingDate = {};
    if (startDate) {
      where.bookingDate.gte = new Date(startDate);
    }
    if (endDate) {
      where.bookingDate.lte = new Date(endDate);
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get bookings and total count
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        bookingDate: "desc",
      },
      include: {
        tourist: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            phoneNumber: true,
            nationality: true,
          },
        },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    data: bookings,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const BookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  completeBooking,
  cancelBooking,
  getListingBookings,
};
