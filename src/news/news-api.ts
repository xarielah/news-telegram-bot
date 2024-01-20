import AuditAction from "../db/models/audit/audit";
import NewsCategory from "../db/models/category/category";
import NewsSource from "../db/models/source/source";
import Logger from "../logger/logger";
import newsApiConfig from "./news-api.config";
import { Article, NewsFetchResponse } from "./news-api.type";

export default class NewsAPI {
  private static logger = new Logger("NewsAPI");

  public static async getCategoryNews(
    userId: number
  ): Promise<NewsFetchResponse> {
    // Fetch user's preferences
    // iterage over each category
    // aggregate all news into one array
    try {
      const userCategories = await NewsCategory.get(userId);

      const result: NewsFetchResponse = {
        status: "ok",
        totalResults: 0,
        articles: [],
      };

      const articles: Article[] = [];

      if (userCategories.categories.length > 0) {
        for (let i = 0; i < userCategories.categories.length; i++) {
          const category = userCategories[i];
          setTimeout(async () => {
            const news = await this.fetchCategoryNews(category);
            articles.push(...news.articles);
          }, 2000);
        }

        result.articles = articles;
        result.totalResults = articles.length;
      }

      await AuditAction.add({
        initiator: "NewsAPI",
        action: "getCategoryNews",
        target: userId.toString(),
        result: "success",
      });
      return result;
    } catch (error) {
      await AuditAction.add({
        initiator: "NewsAPI",
        action: "getCategoryNews",
        target: userId.toString(),
        result: "failed",
      });
    }
  }

  public static async getSourceNews(
    userId: number
  ): Promise<NewsFetchResponse> {
    try {
      const userSources = await NewsSource.get(userId);
      const result = await this.fetchSourcesNews(
        userSources.sources,
        userSources.pageSize
      );

      await AuditAction.add({
        initiator: "NewsAPI",
        action: "getSourceNews",
        target: userId.toString(),
        result: "success",
      });

      return result;
    } catch (error) {
      await AuditAction.add({
        initiator: "NewsAPI",
        action: "getSourceNews",
        target: userId.toString(),
        result: "failed",
      });
      this.logger.log("Getting source news resulted with an error: " + error);
    }
  }

  private static fetchSourcesNews(
    sources: string[],
    pageSize: number
  ): Promise<NewsFetchResponse> {
    return this._fetcher<NewsFetchResponse>(
      this.getCorrectUrl({
        sources: sources.join(","),
        pageSize: pageSize ? pageSize : 5,
      })
    );
  }

  private static fetchCategoryNews(
    category: string
  ): Promise<NewsFetchResponse> {
    return this._fetcher<NewsFetchResponse>(this.getCorrectUrl({ category }));
  }

  private static getCorrectUrl(keyPairs: object): string {
    const searchParams = new URLSearchParams();
    Object.entries(keyPairs).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
    searchParams.append("apiKey", newsApiConfig.token);
    searchParams.append("language", newsApiConfig.language);

    const today = new Date();
    const from =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    searchParams.append("from", from);
    return newsApiConfig.baseUrl + `/top-headlines?${searchParams.toString()}`;
  }

  private static async _fetcher<T>(url: string): Promise<T> {
    return fetch(url).then((res) => res.json());
  }
}
