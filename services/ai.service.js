// services/ai.service.js

const DEFAULT_AI_RESPONSE = {
  insight: "Unable to analyze data",
  recommendation: "Check system manually",
};

const extractJsonObject = (text) => {
  if (!text || typeof text !== "string") {
    return null;
  }

  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1).trim();
  }

  return null;
};

export const getAIInsights = async (data) => {
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  const prompt = `
You are an IoT cold storage expert.

Data:
- Temperature: ${data.temperature}°C
- Humidity: ${data.humidity}%
- Voltage: ${data.voltage}V
- Current: ${data.current}mA

1. Give a short insight about system condition
2. Give a clear recommendation for the farmer

Respond in JSON:
{
  "insight": "...",
  "recommendation": "..."
}
`;

  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY missing, skipping AI insights");
    return DEFAULT_AI_RESPONSE;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    }
  );

  const dataRes = await response.json();

  if (!response.ok) {
    const apiMessage =
      dataRes?.error?.message || `Gemini request failed with status ${response.status}`;
    console.error("Gemini API error:", apiMessage);
    return DEFAULT_AI_RESPONSE;
  }

  const text = dataRes?.candidates?.[0]?.content?.parts?.[0]?.text;
  const jsonString = extractJsonObject(text);

  if (!jsonString) {
    return DEFAULT_AI_RESPONSE;
  }

  try {
    const parsed = JSON.parse(jsonString);

    return {
      insight: parsed?.insight || DEFAULT_AI_RESPONSE.insight,
      recommendation:
        parsed?.recommendation || DEFAULT_AI_RESPONSE.recommendation,
    };
  } catch {
    return DEFAULT_AI_RESPONSE;
  }
};