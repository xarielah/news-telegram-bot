export type NewsFetchResponse = {
  status: string;
  totalResults: number;
  articles: Article[];
};

export type Article = {
  source: ArticleSource;
  author: string | null;
  title: string | null;
  description: string | null;
  url: string | null;
  urlToImage: string | null;
  publishedAt: string | null;
  content: string | null;
};

export type ArticleSource = {
  id: string | null;
  name: string | null;
};
