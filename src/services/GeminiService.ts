import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (API_KEY && API_KEY !== 'your_api_key_here') {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

export const GeminiService = {
    isConfigured: () => !!model,

    generateContent: async (prompt: string) => {
        if (!model) {
            throw new Error('Gemini API is not configured. Please add your API key to the .env file.');
        }

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }
};
