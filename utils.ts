import { AggregateMetrics, PredictionResult, ReviewData, RowResult } from './types';

// Simple CSV Parser
export const parseCSV = (content: string): ReviewData[] => {
  const lines = content.split(/\r?\n/);
  const data: ReviewData[] = [];
  
  // Basic heuristic: assume header exists if first line contains "stars" or "text"
  const hasHeader = lines[0]?.toLowerCase().includes('text') || lines[0]?.toLowerCase().includes('stars');
  const startIndex = hasHeader ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // A very basic comma splitter that handles simple quotes
    // For robust production use, a library like PapaParse is recommended.
    // This is a simplified implementation for the demo.
    const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    
    // Fallback: if complex parsing fails, try simple split but this is risky with commas in text
    // Let's assume the user uses the sample data or a simple format for this demo
    // Or we handle the Kaggle format specifically: "stars","useful","funny","cool","text","date" etc.
    // We'll try to be smart about finding the text and stars.
    
    // If we can't parse reliable CSV without a lib, we'll try to just look for the last number as stars 
    // and the rest as text if the format is text-heavy.
    
    // Better Regex for CSV:
    const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    const cleanMatches = matches.map(m => m.replace(/^"|"$/g, '').replace(/""/g, '"').trim());

    if (cleanMatches.length >= 2) {
      // Try to identify columns. 
      // If we found a number 1-5, likely stars. The longest string likely text.
      let stars = 0;
      let text = '';
      
      // Heuristic: Find first valid star rating
      const starIndex = cleanMatches.findIndex(m => ['1','2','3','4','5'].includes(m));
      if (starIndex !== -1) {
        stars = parseInt(cleanMatches[starIndex], 10);
        // Assume text is another column, prefer longest
        const textCandidates = cleanMatches.filter((_, idx) => idx !== starIndex);
        text = textCandidates.reduce((a, b) => a.length > b.length ? a : b, '');
      } else {
        // Fallback to indices if standard Kaggle format
        // Kaggle Yelp often: stars, ..., text
        const possibleStars = parseInt(cleanMatches[0], 10);
        if (!isNaN(possibleStars)) {
            stars = possibleStars;
            text = cleanMatches[4] || cleanMatches[1]; // Index 4 is common in yelp csv, or 1
        }
      }

      if (text && stars) {
        data.push({
          id: `row-${i}`,
          text: text.substring(0, 500), // Truncate for token efficiency in demo
          actual_stars: stars
        });
      }
    }
  }
  return data;
};

export const calculateMetrics = (results: RowResult[], strategyId: string): AggregateMetrics => {
  let correct = 0;
  let validJson = 0;
  let totalError = 0;
  let count = 0;

  results.forEach(row => {
    const res = row.results[strategyId];
    if (res) {
      count++;
      if (res.is_valid_json) {
        validJson++;
        if (res.predicted_stars === row.review.actual_stars) {
          correct++;
        }
        totalError += Math.abs(res.predicted_stars - row.review.actual_stars);
      } else {
         // Penalty for invalid JSON? 
         // For MAE, if invalid, we can't calc error. We usually exclude or assign max error.
         // Let's exclude from MAE but count in validity.
      }
    }
  });

  return {
    accuracy: count === 0 ? 0 : (correct / count) * 100,
    mae: validJson === 0 ? 0 : totalError / validJson,
    validityRate: count === 0 ? 0 : (validJson / count) * 100,
    totalProcessed: count
  };
};

export const parseGeminiResponse = (text: string): { predicted_stars: number; explanation: string; isValid: boolean } => {
  try {
    // Attempt to clean markdown code blocks
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const json = JSON.parse(cleaned);
    
    if (typeof json.predicted_stars === 'number' && typeof json.explanation === 'string') {
      return {
        predicted_stars: json.predicted_stars,
        explanation: json.explanation,
        isValid: true
      };
    }
    // Handle stringified numbers
    if (json.predicted_stars && !isNaN(parseInt(json.predicted_stars))) {
         return {
            predicted_stars: parseInt(json.predicted_stars),
            explanation: json.explanation || "",
            isValid: true
         };
    }
    return { predicted_stars: 0, explanation: "Invalid JSON Schema", isValid: false };
  } catch (e) {
    return { predicted_stars: 0, explanation: "Parse Error", isValid: false };
  }
};
