import { createGoogleGenerativeAI } from "@ai-sdk/google";

const DEFAULT_AI_RESPONSE = {
  insight: "Unable to analyze data",
  recommendation: "Check system manually",
};

const rawGeminiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
const GOOGLE_GENERATIVE_AI_API_KEY =
  typeof rawGeminiKey === "string" ? rawGeminiKey.trim() : "";

if (!GOOGLE_GENERATIVE_AI_API_KEY) {
  console.warn(
    "GOOGLE_GENERATIVE_AI_API_KEY is not set or is empty. Gemini calls will likely fail."
  );
}

const provider = createGoogleGenerativeAI({
  apiKey: GOOGLE_GENERATIVE_AI_API_KEY || undefined,
});

const getModel = (modelId) => provider.generativeAI(modelId);

const extractText = (result) => {
  if (!result?.content || !Array.isArray(result.content)) {
    return "";
  }

  return result.content
    .filter((part) => part?.text)
    .map((part) => part.text)
    .join(" ")
    .trim();
};

const parseAiResponse = (text) => {
  if (!text) {
    return DEFAULT_AI_RESPONSE;
  }

  const fencedJson = text.match(/```json\s*([\s\S]*?)```/i)?.[1];
  const jsonText = fencedJson || text;

  try {
    const parsed = JSON.parse(jsonText);

    return {
      insight: parsed?.insight || DEFAULT_AI_RESPONSE.insight,
      recommendation:
        parsed?.recommendation || DEFAULT_AI_RESPONSE.recommendation,
    };
  } catch {
    return {
      insight: text.slice(0, 200) || DEFAULT_AI_RESPONSE.insight,
      recommendation: DEFAULT_AI_RESPONSE.recommendation,
    };
  }
};

export const getAIInsights = async (data) => {
  try {
    const prompt = `
You are an IoT cold storage expert.
Analyze the following sensor data and provide a short structured response.

IMPORTANT: Return ONLY valid JSON in this exact shape:
{
  "insight": "...",
  "recommendation": "..."
}

Rules:
- Keep the insight short and practical.
- Keep the recommendation short and actionable.
- Do not include markdown, bullets, or extra commentary.

Sensor data:
${JSON.stringify(data)}
`;

    if (!GOOGLE_GENERATIVE_AI_API_KEY) {
      return DEFAULT_AI_RESPONSE;
    }

    const model = getModel(process.env.GEMINI_MODEL || "gemini-2.5-flash");

    const result = await model.doGenerate({
      prompt: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
      ],
      temperature: 0.2,
    });

    const text = extractText(result);
    return parseAiResponse(text);
  } catch (err) {
    console.error("Gemini service error:", err);
    return DEFAULT_AI_RESPONSE;
  }
};
