
import { BadgeType } from "@prisma/client";

export const BADGE_RULES = {
    // Guide Badges
    [BadgeType.SUPER_GUIDE]: {
        name: "Super Guide",
        description: "Completed 50+ bookings with 4.8+ rating",
        criteria: { minBookings: 50, minRating: 4.8 },
        icon: "https://res.cloudinary.com/demo/image/upload/v1/badges/super_guide.png",
    },
    [BadgeType.TOP_RATED]: {
        name: "Top Rated",
        description: "Maintained 4.9+ rating with 20+ reviews",
        criteria: { minRating: 4.9, minReviews: 20 },
        icon: "https://res.cloudinary.com/demo/image/upload/v1/badges/top_rated.png",
    },
    [BadgeType.NEWCOMER]: {
        name: "Rising Star",
        description: "Completed first 5 bookings successfully",
        criteria: { minBookings: 5 },
        icon: "https://res.cloudinary.com/demo/image/upload/v1/badges/newcomer.png",
    },
    [BadgeType.FOODIE_EXPERT]: {
        name: "Foodie Expert",
        description: "Hosted 10+ food tours",
        criteria: { category: "FOOD", minTours: 10 },
        icon: "https://res.cloudinary.com/demo/image/upload/v1/badges/foodie.png",
    },
    [BadgeType.HISTORY_BUFF]: {
        name: "History Buff",
        description: "Hosted 10+ history tours",
        criteria: { category: "HISTORY", minTours: 10 },
        icon: "https://res.cloudinary.com/demo/image/upload/v1/badges/history.png",
    },

    // Tourist Badges
    [BadgeType.ADVENTURE_SEEKER]: {
        name: "Adventure Seeker",
        description: "Booked 5+ adventure tours",
        criteria: { category: "ADVENTURE", minBookings: 5 },
        icon: "https://res.cloudinary.com/demo/image/upload/v1/badges/adventure.png",
    },
    [BadgeType.CULTURE_ENTHUSIAST]: {
        name: "Culture Enthusiast",
        description: "Booked 5+ cultural tours",
        criteria: { category: "CULTURE", minBookings: 5 },
        icon: "https://res.cloudinary.com/demo/image/upload/v1/badges/culture.png",
    },
    [BadgeType.EXPLORER_LEVEL_1]: {
        name: "Explorer Level 1",
        description: "Completed your first tour",
        criteria: { minBookings: 1 },
        icon: "https://res.cloudinary.com/demo/image/upload/v1/badges/level1.png",
    },
    [BadgeType.EXPLORER_LEVEL_2]: {
        name: "Explorer Level 2",
        description: "Completed 5 tours",
        criteria: { minBookings: 5 },
        icon: "https://res.cloudinary.com/demo/image/upload/v1/badges/level2.png",
    },
    [BadgeType.EXPLORER_LEVEL_3]: {
        name: "Explorer Level 3",
        description: "Completed 10 tours",
        criteria: { minBookings: 10 },
        icon: "https://res.cloudinary.com/demo/image/upload/v1/badges/level3.png",
    },
    [BadgeType.EXPLORER_LEVEL_4]: {
        name: "Explorer Level 4",
        description: "Completed 25 tours",
        criteria: { minBookings: 25 },
        icon: "https://res.cloudinary.com/demo/image/upload/v1/badges/level4.png",
    },
    [BadgeType.EXPLORER_LEVEL_5]: {
        name: "Explorer Level 5",
        description: "Completed 50 tours",
        criteria: { minBookings: 50 },
        icon: "https://res.cloudinary.com/demo/image/upload/v1/badges/level5.png",
    },
};
