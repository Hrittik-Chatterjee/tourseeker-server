
export interface ICheckAchievements {
    userId: string;
}

export interface IGetLeaderboard {
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    limit?: number;
}
