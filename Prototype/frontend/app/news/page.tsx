"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Search, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/layout";
import { PageHeader, EmptyState } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { http, ApiException } from "@/lib/http";
import { formatDate } from "@/lib/format";

interface NewsArticle {
  title: string;
  link: string;
  image?: string;
  content?: string;
  date: string;
}

interface StockNewsArticle {
  title: string;
  url: string;
  image_url?: string;
  description?: string;
  published_at: string;
}

export default function NewsPage() {
  const [generalArticles, setGeneralArticles] = useState<NewsArticle[]>([]);
  const [stockArticles, setStockArticles] = useState<StockNewsArticle[]>([]);
  const [searchTicker, setSearchTicker] = useState<string>("");
  const [lastSearchedTicker, setLastSearchedTicker] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const loadLatestNews = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setIsSearching(false);
      setStockArticles([]);
      
      const newsArticles = await http.get<NewsArticle[]>("/news/latest", { noAuth: true });
      setGeneralArticles(Array.isArray(newsArticles) ? newsArticles : []);
    } catch (err) {
      const message = err instanceof ApiException ? err.message : "Failed to load news";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchNews = useCallback(async (ticker: string): Promise<void> => {
    if (!ticker.trim()) {
      loadLatestNews();
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      setIsSearching(true);
      setLastSearchedTicker(ticker.toUpperCase());
      
      const searchedStockArticles = await http.post<StockNewsArticle[]>(
        "/news/stock", 
        { ticker: ticker.toUpperCase() },
        { noAuth: true }
      );
      setStockArticles(Array.isArray(searchedStockArticles) ? searchedStockArticles : []);
      
      const latestNews = await http.get<NewsArticle[]>("/news/latest", { noAuth: true });
      setGeneralArticles(Array.isArray(latestNews) ? latestNews : []);
    } catch (err) {
      const message = err instanceof ApiException ? err.message : "Failed to load stock news";
      setError(message);
    } finally {
      setSearchLoading(false);
    }
  }, [loadLatestNews]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (searchTicker.trim()) {
      handleSearchNews(searchTicker);
    } else {
      loadLatestNews();
    }
  };

  useEffect(() => {
    loadLatestNews();
  }, [loadLatestNews]);

  return (
    <AppShell>
      <PageHeader 
        title="Market News" 
        description="Stay updated with the latest financial news"
      />

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value)}
              placeholder="Search ticker (e.g., AAPL)"
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={searchLoading}>
            {searchLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      {searchLoading && (
        <div className="flex items-center gap-2 text-sm text-primary mb-6">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Searching for {searchTicker.toUpperCase()}...
        </div>
      )}

      {loading ? (
        <div className="grid gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-8 text-center">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={loadLatestNews}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Stock-specific News */}
          {isSearching && stockArticles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">{lastSearchedTicker} News</h2>
                <Badge variant="secondary">{stockArticles.length} articles</Badge>
              </div>
              <div className="grid gap-4">
                {stockArticles.map((article, index) => (
                  <a
                    key={`stock-${index}-${article.title}`}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Card className="transition-colors hover:bg-accent/50">
                      <CardContent className="p-0">
                        <div className="flex">
                          {article.image_url && (
                            <div className="w-48 h-36 flex-shrink-0 overflow-hidden rounded-l-lg bg-muted">
                              <Image
                                src={article.image_url}
                                alt={article.title}
                                width={192}
                                height={144}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                          <div className="p-4 flex flex-col justify-between flex-1">
                            <div>
                              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {article.title}
                              </h3>
                              {article.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {article.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(article.published_at)}
                              </span>
                              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* General News */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {isSearching ? "General News" : "Latest News"}
            </h2>
            {generalArticles.length === 0 ? (
              <EmptyState variant="news" />
            ) : (
              <div className="grid gap-4">
                {generalArticles.map((article, index) => (
                  <a
                    key={`general-${index}-${article.title}`}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Card className="transition-colors hover:bg-accent/50">
                      <CardContent className="p-0">
                        <div className="flex">
                          {article.image && (
                            <div className="w-48 h-36 flex-shrink-0 overflow-hidden rounded-l-lg bg-muted">
                              <Image
                                src={article.image}
                                alt={article.title}
                                width={192}
                                height={144}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                          )}
                          <div className="p-4 flex flex-col justify-between flex-1">
                            <div>
                              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {article.title}
                              </h3>
                              {article.content && (
                                <div 
                                  className="text-sm text-muted-foreground line-clamp-2"
                                  dangerouslySetInnerHTML={{ __html: article.content }}
                                />
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(article.date)}
                              </span>
                              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
