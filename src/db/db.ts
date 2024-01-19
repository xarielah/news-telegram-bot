import mongoose from "mongoose";
import dbConfig from "./db.config";
import Logger from "../logger/logger";
import { RegisteredUser } from "./models/user/user.model";

export class MongodbConnection {
  static instance: Promise<typeof mongoose>;
  private static logger = new Logger("Database");

  static getInstance() {
    if (!MongodbConnection.instance) {
      MongodbConnection.instance = MongodbConnection.connect();
    }
    return MongodbConnection.instance;
  }

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
      await mongoose.connect(dbConfig.uri);
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
