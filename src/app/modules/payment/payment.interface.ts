export interface ICreatePayment {
  bookingId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface IProcessRefund {
  reason?: string;
  amount?: number; // Partial refund amount (optional, full refund if not specified)
}

export interface IPaymentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
