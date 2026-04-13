import africastalking from "africastalking";

let sms = null;

if (process.env.AT_API_KEY && process.env.AT_USERNAME) {
  const AT = africastalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME,
  });

  sms = AT.SMS;
} else {
  console.warn("⚠️ SMS service disabled (missing AT credentials)");
}

export const sendSMS = async (to, message) => {
  if (!sms) {
    console.warn("SMS not configured, skipping send");
    return;
  }

  try {
    await sms.send({ to, message });
  } catch (err) {
    console.error("SMS Error:", err.message);
  }
};