import express from "express";
import dotenv from "dotenv";
import CronJob from "./cron/job";
import Logger from "./logger/logger";
import { MongodbConnection } from "./db/db";

// Allow us reading the .env file
dotenv.config();

const logger = new Logger("Server");

const app = express();
const PORT = process.env.PORT || 3456;

app.use("/", (_, res) => {
  res.send("Hello World");
});

app.listen(PORT, async () => {
  logger.log(`Server running on port ${PORT}`);
  await MongodbConnection.connect();
  CronJob.run();
});
