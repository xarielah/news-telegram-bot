import dotenv from "dotenv";

// Allow us reading the .env file
dotenv.config();

const BASE_URL = "https://api.telegram.org/bot";

const telegramApiConfig = {
  baseUrl: BASE_URL,
  token: process.env.TELEGRAM_TOKEN,
  apiUrl: `${BASE_URL}${process.env.TELEGRAM_TOKEN}/`,
};

export default telegramApiConfig;
export type TelegramApiConfig = typeof telegramApiConfig;
