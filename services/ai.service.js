// services/ai.service.js

export const getAIInsights = async (data) => {
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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const dataRes = await response.json();

  const text = dataRes.candidates?.[0]?.content?.parts?.[0]?.text;

  try {
    return JSON.parse(text);
  } catch {
    return {
      insight: "Unable to analyze data",
      recommendation: "Check system manually",
    };
  }
};