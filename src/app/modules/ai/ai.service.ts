
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../../../config";
import { prisma } from "../../shared/prisma";
import { IChatWithAI, IGenerateItinerary, IGenerateRecommendations } from "./ai.interface";

const genAI = new GoogleGenerativeAI(config.gemini_api_key as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateRecommendations = async (payload: IGenerateRecommendations) => {
    const { touristId, preferences, history } = payload;

    // Fetch available listings from DB to give context to AI
    const listings = await prisma.listing.findMany({
        where: { isActive: true, isDeleted: false },
        select: {
            id: true,
            title: true,
            city: true,
            country: true,
            categories: true,
            pricePerPerson: true,
            description: true
        },
        take: 20 // Limit context window
    });

    const prompt = `
    You are a travel expert AI.
    User Preferences: ${preferences || "General explorer"}
    User History: ${JSON.stringify(history || [])}
    
    Available Tours: ${JSON.stringify(listings)}

    Recommend top 3 tours for this user based on their preferences and history.
    Return strictly a JSON array of objects with structure:
    [{ "listingId": "id", "score": 0.95, "reason": "Why this matches" }]
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Cleanup markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const recommendations = JSON.parse(cleanText);

        // Store interaction if touristId is present
        if (touristId) {
            await prisma.aIInteraction.create({
                data: {
                    touristId,
                    interactionType: 'recommendation',
                    prompt,
                    response: recommendations
                }
            });
        }

        return recommendations;
    } catch (error) {
        console.error("AI Recommendation Error:", error);
        throw new Error("Failed to generate recommendations");
    }
};

const chatWithAI = async (payload: IChatWithAI) => {
    const { message, context } = payload;

    const prompt = `
    You are a helpful local tour guide assistant.
    Context: ${JSON.stringify(context || {})}
    User Message: ${message}

    Provide a helpful, friendly response. Keep it concise (under 200 words).
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { reply: response.text() };
};

const generateItinerary = async (payload: IGenerateItinerary) => {
    const { destination, days, interests, budget } = payload;

    const prompt = `
     Create a ${days}-day itinerary for ${destination}.
     Interests: ${interests.join(', ')}
     Budget: ${budget || 'Moderate'}

     Return strictly a JSON object with structure:
     {
       "title": "Trip Title",
       "days": [
         {
           "day": 1,
           "activities": ["Activity 1", "Activity 2"]
         }
       ]
     }
   `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const cleanText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
};

export const AIService = {
    generateRecommendations,
    chatWithAI,
    generateItinerary
};
