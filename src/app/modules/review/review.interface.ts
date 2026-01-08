export interface ICreateReview {
  bookingId: string;
  rating: number;
  comment: string;
}

export interface IAddGuideResponse {
  response: string;
}

export interface IReviewFilters {
  page?: number;
  limit?: number;
  rating?: number;
  sortBy?: "createdAt" | "rating";
  sortOrder?: "asc" | "desc";
}
