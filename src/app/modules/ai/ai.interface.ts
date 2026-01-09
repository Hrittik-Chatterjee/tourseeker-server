
export interface IGenerateRecommendations {
    touristId?: string; // Optional for anonymous users
    preferences?: string;
    history?: string[];
}

export interface IChatWithAI {
    message: string;
    context?: any; // Previous messages or booking context
}

export interface IGenerateItinerary {
    destination: string;
    days: number;
    interests: string[];
    budget?: string;
}
