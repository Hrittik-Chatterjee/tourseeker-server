import { BookingStatus } from "@prisma/client";

export interface ICreateBooking {
  listingId: string;
  bookingDate: Date;
  numberOfPeople: number;
  specialRequests?: string;
}

export interface IUpdateBookingStatus {
  status: BookingStatus;
  cancellationReason?: string;
}

export interface IBookingFilters {
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
