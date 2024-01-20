import mongoose from "mongoose";
import dbConfig from "./db.config";
import Logger from "../logger/logger";

/**
 * Responsible for connecting to the database and caching the connection in memory
 */
export class MongodbConnection {
  static instance: Promise<typeof mongoose>;
  private static logger = new Logger("Database");

  static async connect(): Promise<typeof mongoose> {
    mongoose.connection.on("connected", () => {
      this.logger.log("Initiated connection to MongoDB cluster");
    });

    mongoose.connection.on("disconnected", () => {
      this.logger.log("Disconnected from MongoDB cluster");
    });

    mongoose.connection.on("error", (error) => {
      this.logger.log(`Error connecting to MongoDB cluster: ${error}`, "error");
    });

    try {
      if (MongodbConnection.instance === undefined) {
        await mongoose.connect(dbConfig.uri);
      }
    } catch (error) {
      this.logger.log(`Error connecting to MongoDB cluster: ${error}`, "error");
    }
    return mongoose;
  }

  static async disconnect(): Promise<void> {
    await mongoose.disconnect();
    this.instance = null;
  }
}
