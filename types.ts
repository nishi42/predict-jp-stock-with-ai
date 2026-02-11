
export type MarketIndex = 'NIKKEI225' | 'TOPIX';

export interface PriceSet {
  high: number;
  low: number;
  close: number;
}

export interface Prediction {
  id: string;
  date: string; // The date predicted FOR (YYYY-MM-DD)
  index: MarketIndex;
  predicted: PriceSet;
  actual?: PriceSet;
  reasoning: string;
  status: 'PENDING' | 'CLOSED';
  createdAt: string;
}

export interface MarketSummary {
  index: MarketIndex;
  currentPrice: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

export interface PredictionResult {
  high: number;
  low: number;
  close: number;
  reasoning: string;
}
