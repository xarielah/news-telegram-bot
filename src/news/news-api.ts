export default class NewsAPI {
  static newsApi = new NewsAPI();
  public static async getCategoryNews(userId: number): Promise<void> {}

  public static async getSourceNews(userId: number): Promise<void> {}
}
// https://newsapi.org/v2/top-headlines?category=technology&apiKey=f67527f76fd943d096ebd57a59d747c6&from=2024-01-19&language=en&pageSize=5
