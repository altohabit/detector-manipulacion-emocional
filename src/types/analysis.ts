export interface AnalysisResponse {
  detection: string;

  explanation: string;

  impact?: string;

  guidance: string;

  usage?: {
    prompt_tokens: number;

    completion_tokens: number;

    total_tokens: number;
  };

  country?: string;
}

export interface UserMemory {
  patterns: string[];

  emotionalState: string;

  lastUpdated: string;
}
