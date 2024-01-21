import NewsCategory from "../db/models/category/category";
import NewsSource from "../db/models/source/source";
import User from "../db/models/user/user";
import { RegisterUser } from "../db/models/user/user.type";
import Logger from "../logger/logger";
import NewsAPI from "../news/news-api";
import { Article, NewsFetchResponse } from "../news/news-api.type";
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
    this.registerCommand("setsourcelimit", this.setSourceLimit);
    this.registerCommand("setcategorylimit", this.setCategoryLimit);
    this.registerCommand("help", this.help);

    this.registerCommand("addcategory", this.addCategory);
    this.registerCommand("ac", this.addCategory);

    this.registerCommand("removecategory", this.removeCategory);
    this.registerCommand("rc", this.removeCategory);

    this.catchNonCommandMessages();
  }

  /**
   * Get and prints information about the bot.
   */
  public async me(): Promise<void> {
    const response = await TelegramAPI.bot.getMe();
    this.logger.log(`Logged in as ${response.id + ":" + response.username}`);
  }

  private catchNonCommandMessages(): void {
    TelegramAPI.bot.on("message", (msg) => {
      if (msg.text.startsWith("/")) return;
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        "I don't understand you, please use /help to get a list of available commands"
      );
    });
  }

  /**
   * Publish news to all active users
   */
  public async publishNews(): Promise<void> {
    const users = await User.getAllActive();

    for (let user of users) {
      const sourceNews = await NewsAPI.getSourceNews(user.userId);
      const categoryNews = await NewsAPI.getCategoryNews(user.userId);

      await this.sendLetter(user.chatId, sourceNews);
      await this.sendLetter(user.chatId, categoryNews);
    }
  }

  private help(msg: TelegramBOT.Message, _: RegExpMatchArray): void {
    TelegramAPI.bot.sendMessage(
      msg.chat.id,
      `Available commands:
        /subscribe - Subscribe to recieve news updates
        /unsubscribe - Unsubscribe from recieving news updates
        /setsourcelimit - Set the maximum number of sources to recieve news from
        /setcategorylimit - Set the maximum number of categories to recieve news from`
    );
  }

  private async sendLetter(targetId: number, news: NewsFetchResponse) {
    if (news.totalResults === 0) return;
    const messagesArray = this.formatNewsMessage(news.articles);
    for (let msg of messagesArray) {
      TelegramAPI.bot.sendMessage(targetId, msg);
    }
  }

  private formatNewsMessage(articles: Article[]): string[] {
    let messagesArray: string[] = [];
    let message = "";
    let count = 0;
    for (let article of articles) {
      message += `- ${article.title || "No title"}\n\n${
        article.description || "No description"
      }\n\n${article.url || ""}\n\n`;
      if (count % 3 === 0 || count === articles.length - 1) {
        messagesArray.push(message);
        message = "";
      }
    }
    return messagesArray;
  }

  /**
   * Register commands wrapper
   */
  private registerCommand(command: string, callback: Function): void {
    this.logger.log("registering command: " + command, null, null, false);
    TelegramAPI.bot.setMyCommands([
      { command, description: "Description not available" },
    ]);

    TelegramAPI.bot.onText(new RegExp(`/${command}`), (msg, match) => {
      this.logger.log(
        `command ${command} has been called by ${msg.from.username}:${msg.from.id}`,
        null,
        null,
        false
      );
      callback(msg, match);
    });
  }

  private async setSourceLimit(
    msg: TelegramBOT.Message,
    match: RegExpExecArray
  ) {
    const limit = match.input.split(" ")[1];
    if (isNaN(+limit) || +limit < 1 || +limit > 20) {
      return TelegramAPI.bot.sendMessage(
        msg.chat.id,
        `Usage: /setsourcelimit <1-20>`
      );
    }
    const result = await NewsSource.setPageSize(msg.from.id, limit);

    if (result === 1) {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        `Limit has been set to ${limit} sources per delivery successfully`
      );
    } else {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        "Something went wrong, please try again later..."
      );
    }
  }

  private async setCategoryLimit(
    msg: TelegramBOT.Message,
    match: RegExpExecArray
  ) {
    const limit = match.input.split(" ")[1];
    if (isNaN(+limit) || +limit < 1 || +limit > 20) {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        `Usage: /setcategorylimit <1-20>`
      );
      return;
    }
    const result = await NewsCategory.setPageSize(msg.from.id, limit);

    if (result === 1) {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        `Limit has been set to ${limit} sources per delivery successfully`
      );
    } else {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        "Something went wrong, please try again later..."
      );
    }
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

  private async addCategory(msg: TelegramBOT.Message, match: RegExpExecArray) {
    const categories = NewsAPI.getCategories();
    const userCategories = await NewsCategory.get(msg.from.id);
    const message = "Pick a category:\n" + categories.join(", ");
    const category = match.input.split(" ")[1];

    const actualCategories = categories.filter(
      (cat) => !userCategories.categories.includes(cat)
    );

    if (
      (!category || !categories.includes(category)) &&
      actualCategories.length > 0
    ) {
      TelegramAPI.bot.sendMessage(msg.chat.id, message, {
        reply_markup: {
          keyboard: actualCategories.map((category) => [
            { text: "/ac " + category },
          ]),
        },
      });

      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        `Usage: /addcategory <category>`
      );
      return;
    } else if (actualCategories.length === 0) {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        "You already selected all categories available, use /removecategory to remove a category"
      );
      return;
    }
    const result = await NewsCategory.add(msg.from.id, category);

    if (result) {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        `Category ${category} has been added successfully`
      );
    } else if (result === false) {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        `Category ${category} already exists`
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

  private async removeCategory(
    msg: TelegramBOT.Message,
    match: RegExpMatchArray
  ) {
    const userCategories = await NewsCategory.get(msg.from.id);

    if (userCategories.categories.length === 0) {
      TelegramAPI.bot.sendMessage(
        msg.chat.id,
        "You have no categories to remove, use /addcategory to add a category"
      );
      return;
    }

    const category = match.input.split(" ")[1];

    if (!category) {
      const message =
        "Pick a category to remove:\n" + userCategories.categories.join(", ");
      TelegramAPI.bot.sendMessage(msg.chat.id, message, {
        reply_markup: {
          keyboard: userCategories.categories.map((category) => [
            { text: "/rc " + category },
          ]),
        },
      });

      if (!userCategories.categories.includes(category)) {
        TelegramAPI.bot.sendMessage(
          msg.chat.id,
          `Category ${category} does not exists`
        );
      }

      const result = await NewsCategory.remove(msg.from.id, category);

      if (result) {
        TelegramAPI.bot.sendMessage(
          msg.chat.id,
          `Category ${category} has been removed successfully`
        );
      } else if (result === false) {
        TelegramAPI.bot.sendMessage(
          msg.chat.id,
          `Category ${category} does not exists`
        );
      } else {
        TelegramAPI.bot.sendMessage(
          msg.chat.id,
          "Something went wrong, please try again later..."
        );
      }
    }
  }

  public sendMessage(chatId: string, message: string) {
    TelegramAPI.bot.sendMessage(chatId, message);
  }
}
