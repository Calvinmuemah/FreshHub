// utils/alerts.js
import { sendSMS } from "../services/sms.service.js";
import { sendEmail } from "../services/email.service.js";

export const checkAlerts = async (data, user) => {
  let message = "";

  if (data.temperature > 10) {
    message += "⚠️ High temperature! ";
  }

  if (data.voltage < 3.3) {
    message += "🔋 Low battery! ";
  }

  if (data.current > 500) {
    message += "⚡ High power usage! ";
  }

  if (message) {
    message += `Temp: ${data.temperature}°C`;

    await sendSMS(user.phone_number, message);
    await sendEmail(user.email, "BaridiBox Alert", message);
  }
};