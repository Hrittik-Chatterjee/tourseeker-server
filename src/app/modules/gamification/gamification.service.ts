
import { BadgeType, UserRole, Prisma, BookingStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { BADGE_RULES } from "./badge-rules";
import { IGetLeaderboard } from "./gamification.interface";

// Helper to award badge
const awardBadge = async (
    userId: string,
    role: UserRole,
    badgeType: BadgeType
) => {
    const rule = BADGE_RULES[badgeType];
    if (!rule) return;

    // Check if badge already exists in DB definition, if not create it
    let badge = await prisma.badge.findUnique({
        where: { type: badgeType },
    });

    if (!badge) {
        badge = await prisma.badge.create({
            data: {
                type: badgeType,
                name: rule.name,
                description: rule.description,
                icon: rule.icon,
                criteria: rule.criteria as Prisma.InputJsonValue,
            },
        });
    }

    // Check if user already has this badge
    if (role === UserRole.TOURIST) {
        const existingBadge = await prisma.touristBadge.findUnique({
            where: {
                touristId_badgeId: {
                    touristId: userId,
                    badgeId: badge.id,
                },
            },
        });

        if (!existingBadge) {
            await prisma.touristBadge.create({
                data: {
                    touristId: userId,
                    badgeId: badge.id,
                },
            });
            return { awarded: true, badge: rule.name };
        }
    } else if (role === UserRole.GUIDE) {
        const existingBadge = await prisma.guideBadge.findUnique({
            where: {
                guideId_badgeId: {
                    guideId: userId,
                    badgeId: badge.id,
                },
            },
        });

        if (!existingBadge) {
            await prisma.guideBadge.create({
                data: {
                    guideId: userId,
                    badgeId: badge.id,
                },
            });
            return { awarded: true, badge: rule.name };
        }
    }

    return { awarded: false };
};

// Check achievements for a user
const checkAchievements = async (userId: string, role: UserRole) => {
    const awardedBadges: string[] = [];

    // Get user profile
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            tourist: true,
            guide: true
        }
    });

    if (!user) throw new Error("User not found");

    const profileId = role === UserRole.TOURIST ? user.tourist?.id : user.guide?.id;
    if (!profileId) throw new Error("Profile not found");

    if (role === UserRole.GUIDE) {
        // GUIDE CHECKS
        const guide = await prisma.guide.findUnique({
            where: { id: profileId },
            include: {
                listings: true
            }
        });

        if (!guide) return { message: "Guide not found", awardedBadges };

        const totalBookings = guide.totalBookings;
        const rating = guide.rating;

        // Check Super Guide
        if (totalBookings >= 50 && rating >= 4.8) {
            const result = await awardBadge(profileId, UserRole.GUIDE, BadgeType.SUPER_GUIDE);
            if (result?.awarded && result.badge) awardedBadges.push(result.badge);
        }

        // Check Top Rated
        if (rating >= 4.9 && guide.totalReviews >= 20) {
            const result = await awardBadge(profileId, UserRole.GUIDE, BadgeType.TOP_RATED);
            if (result?.awarded && result.badge) awardedBadges.push(result.badge);
        }

        // Check Newcomer
        if (totalBookings >= 5) {
            const result = await awardBadge(profileId, UserRole.GUIDE, BadgeType.NEWCOMER);
            if (result?.awarded && result.badge) awardedBadges.push(result.badge);
        }

        // Check specific categories (Food, History, etc.) - Simplified logic for now
        // In a real app, we'd query past completed bookings by category
    } else {
        // TOURIST CHECKS
        const tourist = await prisma.tourist.findUnique({ where: { id: profileId } });
        if (!tourist) return { message: "Tourist not found", awardedBadges };

        const completedTours = tourist.totalToursBooked;

        // Explorer Levels
        if (completedTours >= 1) {
            const result = await awardBadge(profileId, UserRole.TOURIST, BadgeType.EXPLORER_LEVEL_1);
            if (result?.awarded && result.badge) awardedBadges.push(result.badge);
        }
        if (completedTours >= 5) {
            const result = await awardBadge(profileId, UserRole.TOURIST, BadgeType.EXPLORER_LEVEL_2);
            if (result?.awarded && result.badge) awardedBadges.push(result.badge);
        }
        if (completedTours >= 10) {
            const result = await awardBadge(profileId, UserRole.TOURIST, BadgeType.EXPLORER_LEVEL_3);
            if (result?.awarded && result.badge) awardedBadges.push(result.badge);
        }
        if (completedTours >= 25) {
            const result = await awardBadge(profileId, UserRole.TOURIST, BadgeType.EXPLORER_LEVEL_4);
            if (result?.awarded && result.badge) awardedBadges.push(result.badge);
        }
        if (completedTours >= 50) {
            const result = await awardBadge(profileId, UserRole.TOURIST, BadgeType.EXPLORER_LEVEL_5);
            if (result?.awarded && result.badge) awardedBadges.push(result.badge);
        }
    }

    return {
        message: awardedBadges.length > 0 ? "New badges awarded" : "No new badges earned",
        awardedBadges,
    };
};

// Get my badges
const getMyBadges = async (userId: string, role: UserRole) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            tourist: true,
            guide: true
        }
    });

    if (!user) throw new Error("User not found");
    const profileId = role === UserRole.TOURIST ? user.tourist?.id : user.guide?.id;

    if (!profileId) throw new Error("Profile not found");

    if (role === UserRole.TOURIST) {
        const badges = await prisma.touristBadge.findMany({
            where: { touristId: profileId },
            include: { badge: true },
        });
        return badges.map(b => ({ ...b.badge, earnedAt: b.earnedAt }));
    } else {
        const badges = await prisma.guideBadge.findMany({
            where: { guideId: profileId },
            include: { badge: true },
        });
        return badges.map(b => ({ ...b.badge, earnedAt: b.earnedAt }));
    }
};

// Get leaderboard
const getLeaderboard = async (params: IGetLeaderboard) => {
    // This is a simplified leaderboard relying on the Guide table's aggregated stats
    // A more complex implementation would use the Leaderboard model with periodic calculation jobs
    const { limit = 10 } = params;

    const topGuides = await prisma.guide.findMany({
        where: { isDeleted: false, user: { status: 'ACTIVE' } },
        orderBy: [
            { rating: 'desc' },
            { totalBookings: 'desc' }
        ],
        take: Number(limit),
        select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
            totalBookings: true,
            city: true,
            country: true
        }
    });

    return topGuides.map((guide, index) => ({
        rank: index + 1,
        ...guide
    }));
};

export const GamificationService = {
    checkAchievements,
    getMyBadges,
    getLeaderboard,
};
