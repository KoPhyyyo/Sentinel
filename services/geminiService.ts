
import { GoogleGenAI } from "@google/genai";
import { OsintBrief } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getOsintBriefing = async (): Promise<OsintBrief> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Search for the latest global cybersecurity incidents, data breaches, or critical vulnerabilities reported in the last 24 hours. Summarize the top 3 items clearly.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No intelligence data available at this time.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceUrls = chunks
      .map((chunk: any) => chunk.web?.uri)
      .filter((uri: string | undefined): uri is string => !!uri);

    return {
      title: "Global Threat Intelligence Report",
      summary: text,
      sourceUrls: Array.from(new Set(sourceUrls)),
      lastUpdated: new Date().toLocaleTimeString()
    };
  } catch (error) {
    console.error("Gemini OSINT Error:", error);
    return {
      title: "Intelligence Feed Offline",
      summary: "Failed to connect to the global intelligence matrix. Please check your credentials or network status.",
      sourceUrls: [],
      lastUpdated: new Date().toLocaleTimeString()
    };
  }
};

export const analyzeAttackVector = async (attackType: string, severity: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Quick technical analysis of a ${severity} level ${attackType} in a cybersecurity context. Provide a 2-sentence tactical response recommendation.`,
    });
    return response.text || "No analysis available.";
  } catch {
    return "Standard incident response protocols engaged.";
  }
};
