import { GoogleGenAI } from "@google/genai";
import { parseGeminiResponse } from "../utils";
import { PredictionResult } from "../types";

export class GeminiService {
  private client: GoogleGenAI;

  constructor() {
    // We assume the key is available. If not, the component will handle the error/prompt.
    const apiKey = process.env.API_KEY || ''; 
    this.client = new GoogleGenAI({ apiKey });
  }

  async analyzeReview(reviewText: string, promptTemplate: string): Promise<PredictionResult> {
    const prompt = promptTemplate.replace('{{text}}', reviewText);
    
    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json', // Enforce JSON for better UX, but we measure validity still
          temperature: 0.2, // Lower temp for more deterministic classification
        }
      });

      const text = response.text || "{}";
      const parsed = parseGeminiResponse(text);

      return {
        predicted_stars: parsed.predicted_stars,
        explanation: parsed.explanation,
        raw_response: text,
        is_valid_json: parsed.isValid,
        timestamp: Date.now()
      };
    } catch (error: any) {
      console.error("Gemini API Error", error);
      return {
        predicted_stars: 0,
        explanation: `API Error: ${error.message || 'Unknown error'}`,
        raw_response: '',
        is_valid_json: false,
        timestamp: Date.now()
      };
    }
  }
}

export const geminiService = new GeminiService();
