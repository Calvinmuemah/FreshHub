// Spoilage prediction service
export const predictSpoilage = async (deviceId, { temperature, humidity }) => {
  try {
    // Basic spoilage risk logic based on temperature and humidity
    // Higher temps + higher humidity = higher spoilage risk
    
    let risk = "LOW";

    // Risk thresholds
    if (temperature > 25 && humidity > 70) {
      risk = "HIGH";
    } else if (temperature > 20 && humidity > 60) {
      risk = "MEDIUM";
    } else if (temperature < 5 || temperature > 30) {
      risk = "MEDIUM";
    }

    return {
      deviceId,
      risk,
      temperature,
      humidity,
      predictedAt: new Date(),
    };
  } catch (error) {
    console.error("Spoilage prediction error:", error);
    return { risk: "UNKNOWN" };
  }
};
