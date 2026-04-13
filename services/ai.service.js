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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const configuredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const fallbackModels = [
      configuredModel,
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
    ];

    let lastError = null;

    for (const [index, modelId] of fallbackModels.entries()) {
      try {
        const model = getModel(modelId);

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
        const parsed = parseAiResponse(text);

        if (
          parsed.insight !== DEFAULT_AI_RESPONSE.insight ||
          parsed.recommendation !== DEFAULT_AI_RESPONSE.recommendation
        ) {
          return parsed;
        }

        // If the provider responded but the payload was empty/invalid, continue to fallback models.
        lastError = new Error(`Empty or invalid Gemini response from ${modelId}`);
      } catch (err) {
        lastError = err;

        const retryable = err?.statusCode === 503 || err?.isRetryable;
        const isLastAttempt = index === fallbackModels.length - 1;

        if (retryable && !isLastAttempt) {
          await sleep(400 * (index + 1));
          continue;
        }

        console.error(`Gemini model ${modelId} failed:`, err?.message || err);
      }
    }

    if (lastError) {
      console.warn("Gemini fallback to default response:", lastError?.message || lastError);
    }

    return DEFAULT_AI_RESPONSE;
  } catch (err) {
    console.error("Gemini service error:", err);
    return DEFAULT_AI_RESPONSE;
  }
};
