
import { prisma } from "../../shared/prisma";
import { AnalyticsPeriod, BookingStatus } from "@prisma/client";
import { IGenerateSnapshot, IGetDashboard } from "./analytics.interface";

const generateSnapshot = async (payload: IGenerateSnapshot) => {
    const { guideId, period, date = new Date() } = payload;

    // Calculate start/end dates based on period
    let startDate = new Date(date);
    let endDate = new Date(date);

    if (period === 'DAILY') {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    } else if (period === 'WEEKLY') {
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
    } else if (period === 'MONTHLY') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    // Fetch metrics
    const bookings = await prisma.booking.findMany({
        where: {
            guideId,
            createdAt: {
                gte: startDate,
                lte: endDate
            },
            status: BookingStatus.COMPLETED
        },
        include: {
            listing: true
        }
    });

    const reviews = await prisma.review.findMany({
        where: {
            guideId,
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        }
    });

    const totalBookings = bookings.length;
    // Calculate revenue assuming a simple formula (price * hours * tourists) or just totalCost if available
    // For this MVP we will approximate from listing price if totalCost not on Booking (Booking model in this proj might vary)
    // Let's assume listing.pricePerPerson * 1 for now or check if booking has totalCost.
    // Checking schema earlier: Booking has no totalCost, Listing has pricePerPerson. 
    // We'll calculate: sum(listing.pricePerPerson) -> Simplify for MVP.
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.listing.pricePerPerson || 0), 0);

    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const newReviews = reviews.length;

    // Find top tours
    const tourCounts: Record<string, number> = {};
    bookings.forEach(b => {
        tourCounts[b.listingId] = (tourCounts[b.listingId] || 0) + 1;
    });

    // Create or Update Snapshot
    const snapshot = await prisma.analyticsSnapshot.upsert({
        where: {
            guideId_period_periodDate: {
                guideId,
                period: period as AnalyticsPeriod, // Cast to enum
                periodDate: startDate
            }
        },
        update: {
            totalBookings,
            totalRevenue,
            averageRating,
            newReviews,
            topTours: tourCounts,
            metadata: { calculatedAt: new Date() }
        },
        create: {
            guideId,
            period: period as AnalyticsPeriod,
            periodDate: startDate,
            totalBookings,
            totalRevenue,
            averageRating,
            newReviews,
            topTours: tourCounts,
            metadata: { calculatedAt: new Date() }
        }
    });

    return snapshot;
};

const getDashboard = async (payload: IGetDashboard) => {
    const { guideId, period = 'MONTHLY' } = payload;

    // Get last 12 snapshots for the period
    const snapshots = await prisma.analyticsSnapshot.findMany({
        where: {
            guideId,
            period: period as AnalyticsPeriod
        },
        orderBy: {
            periodDate: 'asc'
        },
        take: 12
    });

    // Provide a summary of current stats (lifetime)
    const guide = await prisma.guide.findUnique({
        where: { id: guideId },
        select: { totalBookings: true, totalRevenue: true, rating: true, totalReviews: true }
    });

    return {
        summary: guide,
        chartData: snapshots
    };
};

export const AnalyticsService = {
    generateSnapshot,
    getDashboard
};
