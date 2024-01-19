import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("No mongo uri defined");
}

const dbConfig = {
  uri: process.env.MONGO_URI,
};

export default dbConfig;
export type DbConfig = typeof dbConfig;
