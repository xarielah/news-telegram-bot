import cron from "node-cron";
import Logger from "../logger/logger";
import TelegramAPI from "../service/telegram-api.service";

export default class CronJob {
  private static logger = new Logger("CronJob");

  public static async run() {
    this.logger.log(
      "Cron job has been triggered and running...",
      null,
      null,
      false
    );

    const api = new TelegramAPI();
    api.me();
    // api.publishNews();

    // cron.schedule("*/5 * * * * *", () => {
    //   // Whatever we do here, it'll be executed with interval that we scheduled
    //   this.logger.log("Running a job every minute");
    // });
  }
}
