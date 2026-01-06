export interface ReviewData {
  id: string;
  text: string;
  actual_stars: number;
}

export interface PredictionResult {
  predicted_stars: number;
  explanation: string;
  raw_response?: string;
  is_valid_json: boolean;
  timestamp: number;
}

export interface RowResult {
  review: ReviewData;
  results: Record<string, PredictionResult>; // key is strategyId
}

export interface PromptStrategy {
  id: string;
  name: string;
  description: string;
  template: string; // Use {{text}} as placeholder
  color: string;
}

export interface AggregateMetrics {
  accuracy: number; // Exact match %
  mae: number; // Mean Absolute Error
  validityRate: number; // % of valid JSON responses
  totalProcessed: number;
}

export type ProcessingStatus = 'idle' | 'running' | 'paused' | 'completed';
