
export interface IGenerateSnapshot {
    guideId: string;
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    date?: Date;
}

export interface IGetDashboard {
    guideId: string;
    period?: 'DAILY' | 'WEEKLY' | 'MONTHLY'; // Default MONTHLY
}
