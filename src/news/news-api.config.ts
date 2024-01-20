import dotenv from "dotenv";
dotenv.config();

const NEWS_API_TOKEN = process.env.NEWS_API_TOKEN;

if (!NEWS_API_TOKEN) {
  throw new Error("No news api token defined");
}

const newsApiConfig = {
  token: NEWS_API_TOKEN,
  baseUrl: "https://newsapi.org/v2",
  language: "en",
};

export default newsApiConfig;
export type NewsApiConfig = typeof newsApiConfig;
