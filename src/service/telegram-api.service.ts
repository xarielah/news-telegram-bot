import User from "../db/models/user/user";
import { RegisteredUser } from "../db/models/user/user.model";
import { RegisterUser } from "../db/models/user/user.type";
import Logger from "../logger/logger";
import telegramApiConfig from "./telegram-api.config";
import TelegramBOT from "node-telegram-bot-api";

export default class TelegramAPI {
  private logger = new Logger("TelegramAPI");
  private static bot = new TelegramBOT(telegramApiConfig.token, {
    polling: true,
  });

  constructor() {
    this.logger.log("TelegramAPI has been initialized");
    this.registerCommand("subscribe", this.subscribe);
    this.registerCommand("unsubscribe", this.unsubscribe);
  }

  /**
   * Get and prints information about the bot.
   */
  public async me(): Promise<void> {
    const response = await TelegramAPI.bot.getMe();
    this.logger.log(`Logged in as ${response.id + ":" + response.username}`);
  }

  /**
   * Register commands wrapper
   */
  private registerCommand(command: string, callback: Function): void {
    TelegramAPI.bot.onText(new RegExp("/" + command), (msg, match) => {
      callback(msg, match);
    });
  }

  private async subscribe(
    msg: TelegramBOT.Message,
    match: RegExpExecArray
  ): Promise<void> {
    const registeredUser: RegisterUser = {
      username: msg.from.username,
      chatId: msg.chat.id,
      userId: msg.from.id,
    };

    const result = await User.subscribe(registeredUser);

    if (result === -1) {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        "You are already subscribed, to unsubscribe use /unsubscribe command"
      );
    } else if (result === 1) {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        "You have been subscribed successfully, to unsubscribe use /unsubscribe command"
      );
    } else {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        "Something went wrong, please try again later..."
      );
    }
  }

  private async unsubscribe(
    msg: TelegramBOT.Message,
    match: RegExpExecArray
  ): Promise<void> {
    const result = await User.unsubscribe(msg.from.id);

    if (result === -1) {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        "You are already unsubscribed from recieving updates, to resubscribe use /subscribe command"
      );
    } else if (result === 1) {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        "You have been unsubscribed successfully, to unsubscribe use /unsubscribe command"
      );
    } else {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        "Something went wrong, please try again later..."
      );
    }
  }

  public sendMessage(chatId: string, message: string) {
    TelegramAPI.bot.sendMessage(chatId, message);
  }
}
