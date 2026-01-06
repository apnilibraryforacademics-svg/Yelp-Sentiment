import { PromptStrategy, ReviewData } from './types';

export const SAMPLE_DATA: ReviewData[] = [
  { id: '1', text: "The service was terrible and the food was cold. Never coming back.", actual_stars: 1 },
  { id: '2', text: "Absolutely loved the ambiance. The pasta was perfect. Highly recommend!", actual_stars: 5 },
  { id: '3', text: "It was okay. Not great, not bad. Just average average food.", actual_stars: 3 },
  { id: '4', text: "Wait times were long, but the burger was worth it. Solid 4 stars.", actual_stars: 4 },
  { id: '5', text: "Disgusting hygiene. Found a hair in my soup.", actual_stars: 1 },
  { id: '6', text: "Best pizza in town, hands down! The crust is to die for.", actual_stars: 5 },
  { id: '7', text: "Quite expensive for the portion size. Taste was mediocre.", actual_stars: 2 },
  { id: '8', text: "Great selection of beers, but the music is too loud to talk.", actual_stars: 3 },
  { id: '9', text: "Friendly staff, clean environment, and tasty breakfast options.", actual_stars: 4 },
  { id: '10', text: "I have mixed feelings. Appetizers were great, main course was salty.", actual_stars: 3 },
  { id: '11', text: "A hidden gem! The chef came out to greet us. Unforgettable experience.", actual_stars: 5 },
  { id: '12', text: "Rude hostess. We walked out before even sitting down.", actual_stars: 1 },
];

export const DEFAULT_STRATEGIES: PromptStrategy[] = [
  {
    id: 's1_direct',
    name: 'Direct / Zero-Shot',
    description: 'A simple, direct instruction to classify the review without examples.',
    color: '#3b82f6', // blue
    template: `You are a sentiment analysis system. 
Task: Predict the star rating (1-5) for the following Yelp review.
Output Requirement: Return ONLY a valid JSON object with the format: {"predicted_stars": <number>, "explanation": "<string>"}.

Review: "{{text}}"`,
  },
  {
    id: 's2_fewshot',
    name: 'Few-Shot Learning',
    description: 'Provides examples of reviews and their ratings to guide the model.',
    color: '#8b5cf6', // purple
    template: `System: You are an expert review classifier.
Below are examples of Yelp reviews and their correct star ratings:

Example 1:
Review: "The valet ruined my car and the manager didn't care."
Output: {"predicted_stars": 1, "explanation": "Severe negative service experience and damage."}

Example 2:
Review: "Pretty good tacos, but the salsa was too spicy for me."
Output: {"predicted_stars": 4, "explanation": "Mostly positive, minor subjective complaint."}

Example 3:
Review: "Neutral experience. Nothing to write home about."
Output: {"predicted_stars": 3, "explanation": "Average experience, no strong emotion."}

Now, predict the rating for this new review. Return ONLY valid JSON.

Review: "{{text}}"`,
  },
  {
    id: 's3_cot',
    name: 'Chain-of-Thought',
    description: 'Asks the model to reason step-by-step before assigning a score.',
    color: '#10b981', // green
    template: `Analyze the following Yelp review to determine the appropriate star rating (1-5).

Instructions:
1. Identify the key sentiment words (positive vs negative).
2. Assess the intensity of the emotions expressed.
3. Check for specific complaints or praise regarding Service, Food, or Ambiance.
4. Weigh these factors to determine the final score.

Format the output as a JSON object: {"predicted_stars": <integer>, "explanation": "<your step-by-step reasoning>"}

Review: "{{text}}"`,
  }
];
