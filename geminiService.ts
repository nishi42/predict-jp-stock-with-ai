
import { GoogleGenAI, Type } from "@google/genai";
import { MarketIndex, PredictionResult, MarketSummary, PriceSet } from "./types";

const MODEL_NAME = 'gemini-3-flash-preview';

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

/**
 * Fetch current market data
 */
export const fetchMarketData = async (index: MarketIndex): Promise<MarketSummary> => {
  const ai = getGeminiClient();
  const query = `${index === 'NIKKEI225' ? '日経平均株価 (Nikkei 225)' : 'TOPIX'} の最新の終値、前日比、騰落率を教えてください。`;
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentPrice: { type: Type.NUMBER },
          change: { type: Type.NUMBER },
          changePercent: { type: Type.NUMBER },
          lastUpdated: { type: Type.STRING }
        },
        required: ["currentPrice", "change", "changePercent", "lastUpdated"]
      }
    }
  });

  try {
    return { index, ...JSON.parse(response.text) };
  } catch (e) {
    throw new Error("市場データの取得に失敗しました。");
  }
};

/**
 * Generate predictions for High, Low, and Close prices
 */
export const generateDailyPrediction = async (index: MarketIndex, targetDate: string): Promise<PredictionResult> => {
  const ai = getGeminiClient();
  const indexName = index === 'NIKKEI225' ? '日経平均株価' : 'TOPIX';
  
  const prompt = `
    プロの金融アナリストとして、${targetDate} の${indexName}の動きを予測してください。
    最新の米国市場終値、夜間先物、主要な経済指標、為替、および地政学的リスクを検索・分析してください。
    
    以下の3つの値を予測してください：
    1. 最高値 (High)
    2. 最安値 (Low)
    3. 終値 (Close)
    
    必ず以下のJSON形式で回答してください：
    {
      "high": 数値,
      "low": 数値,
      "close": 数値,
      "reasoning": "予測の根拠（日本語、200文字程度）"
    }
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          high: { type: Type.NUMBER },
          low: { type: Type.NUMBER },
          close: { type: Type.NUMBER },
          reasoning: { type: Type.STRING }
        },
        required: ["high", "low", "close", "reasoning"]
      }
    }
  });

  return JSON.parse(response.text);
};

/**
 * Check actual High, Low, and Close prices for a specific date
 */
export const fetchActualPrices = async (index: MarketIndex, date: string): Promise<PriceSet | null> => {
  const ai = getGeminiClient();
  const indexName = index === 'NIKKEI225' ? '日経平均株価' : 'TOPIX';
  const query = `${date}の${indexName}の「最高値」「最安値」「終値」の確定値を教えてください。まだ確定していない項目がある場合は all_set を false にしてください。`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          all_set: { type: Type.BOOLEAN },
          high: { type: Type.NUMBER },
          low: { type: Type.NUMBER },
          close: { type: Type.NUMBER }
        },
        required: ["all_set"]
      }
    }
  });

  const data = JSON.parse(response.text);
  if (data.all_set && data.high && data.low && data.close) {
    return { high: data.high, low: data.low, close: data.close };
  }
  return null;
};
