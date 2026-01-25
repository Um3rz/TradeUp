"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Search, ExternalLink, Brain } from "lucide-react";
import { AppShell } from "@/components/layout";
import { PageHeader, EmptyState } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { http, ApiException } from "@/lib/http";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

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

interface LocalNewsArticle {
  title: string;
  link: string;
  pubDate: string;
  content?: string;
  contentSnippet?: string;
  source: string;
  category?: string;
}

interface SentimentAnalysisResponse {
  title: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  reasoning: string;
  keywords: string[];
}

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState<'global' | 'local'>('global');
  const [generalArticles, setGeneralArticles] = useState<NewsArticle[]>([]);
  const [localArticles, setLocalArticles] = useState<LocalNewsArticle[]>([]);
  const [stockArticles, setStockArticles] = useState<StockNewsArticle[]>([]);
  const [searchTicker, setSearchTicker] = useState<string>("");
  const [lastSearchedTicker, setLastSearchedTicker] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [analyzingArticles, setAnalyzingArticles] = useState<Set<string>>(new Set());

  const handleSentimentAnalysis = async (articleTitle: string, e: React.MouseEvent): Promise<void> => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Prevent event bubbling
    
    // Add this article to the analyzing set
    setAnalyzingArticles(prev => new Set(prev).add(articleTitle));
    
    try {
      // Send the news title to backend for sentiment analysis
      const response = await http.post<SentimentAnalysisResponse>('/news/sentiment-analysis', {
        title: articleTitle
      });
      
      // Display the sentiment analysis results
      const sentimentEmoji = {
        positive: '😊',
        negative: '😟',
        neutral: '😐'
      }[response.sentiment];
      
      // Show success toast with results
      toast.success(
        `${sentimentEmoji} Sentiment: ${response.sentiment.toUpperCase()}`,
        {
          description: `${response.reasoning}\nKeywords: ${response.keywords.join(', ')}`,
          duration: 8000,
        }
      );
      
    } catch (err) {
      console.error('Sentiment analysis failed:', err);
      toast.error('Failed to analyze sentiment', {
        description: 'Please try again later.',
      });
    } finally {
      // Remove this article from the analyzing set
      setAnalyzingArticles(prev => {
        const newSet = new Set(prev);
        newSet.delete(articleTitle);
        return newSet;
      });
    }
  };

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

  const loadLocalNews = useCallback(async (): Promise<void> => {
    try {
      setLocalLoading(true);
      setError(null);
      
      const localNewsArticles = await http.get<LocalNewsArticle[]>("/news/local", { noAuth: true });
      setLocalArticles(Array.isArray(localNewsArticles) ? localNewsArticles : []);
    } catch (err) {
      const message = err instanceof ApiException ? err.message : "Failed to load local news";
      setError(message);
    } finally {
      setLocalLoading(false);
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

  useEffect(() => {
    if (activeTab === 'local' && localArticles.length === 0) {
      loadLocalNews();
    }
  }, [activeTab, localArticles.length, loadLocalNews]);

  return (
    <AppShell>
      <PageHeader 
        title="Market News" 
        description="Stay updated with the latest financial news"
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'global'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Global News
        </button>
        <button
          onClick={() => setActiveTab('local')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'local'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Local News
        </button>
      </div>

      {/* Global News Tab */}
      {activeTab === 'global' && (
        <>
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

          {loading && (
            <div className="grid gap-6">
              {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((key) => (
                <div key={key} className="h-48 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          )}
          
          {!loading && error && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="py-8 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={loadLatestNews}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
          
          {!loading && !error && (
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
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={(e: React.MouseEvent) => handleSentimentAnalysis(article.title, e)}
                                      className="h-6 w-6 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all duration-200"
                                      title="Analyze sentiment"
                                      disabled={analyzingArticles.has(article.title)}
                                    >
                                      {analyzingArticles.has(article.title) ? (
                                        <div className="h-3 w-3 animate-spin rounded-full border border-emerald-500 border-t-transparent" />
                                      ) : (
                                        <Brain className="h-3 w-3" />
                                      )}
                                    </Button>
                                    {analyzingArticles.has(article.title) && (
                                      <span className="text-xs text-emerald-600 font-medium">Analyzing...</span>
                                    )}
                                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                  </div>
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
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={(e: React.MouseEvent) => handleSentimentAnalysis(article.title, e)}
                                      className="h-6 w-6 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all duration-200"
                                      title="Analyze sentiment"
                                      disabled={analyzingArticles.has(article.title)}
                                    >
                                      {analyzingArticles.has(article.title) ? (
                                        <div className="h-3 w-3 animate-spin rounded-full border border-emerald-500 border-t-transparent" />
                                      ) : (
                                        <Brain className="h-3 w-3" />
                                      )}
                                    </Button>
                                    {analyzingArticles.has(article.title) && (
                                      <span className="text-xs text-emerald-600 font-medium">Analyzing...</span>
                                    )}
                                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                  </div>
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
        </>
      )}

      {/* Local News Tab */}
      {activeTab === 'local' && (
        <>
          {localLoading && (
            <div className="grid gap-6">
              {Array.from({ length: 4 }, (_, i) => `local-skeleton-${i}`).map((key) => (
                <div key={key} className="h-48 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          )}
          
          {!localLoading && error && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="py-8 text-center">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={loadLocalNews}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
          
          {!localLoading && !error && localArticles.length === 0 && (
            <EmptyState variant="news" />
          )}
          
          {!localLoading && !error && localArticles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">Dawn Business News</h2>
                <Badge variant="secondary">{localArticles.length} articles</Badge>
              </div>
              <div className="grid gap-4">
                {localArticles.map((article, index) => (
                  <a
                    key={`local-${index}-${article.title}`}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Card className="transition-colors hover:bg-accent/50">
                      <CardContent className="p-4">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1">
                              {article.title}
                            </h3>
                            <Badge variant="outline" className="flex-shrink-0">
                              {article.source}
                            </Badge>
                          </div>
                          {article.contentSnippet && (
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                              {article.contentSnippet}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(article.pubDate)}
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e: React.MouseEvent) => handleSentimentAnalysis(article.title, e)}
                                className="h-6 w-6 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all duration-200"
                                title="Analyze sentiment"
                                disabled={analyzingArticles.has(article.title)}
                              >
                                {analyzingArticles.has(article.title) ? (
                                  <div className="h-3 w-3 animate-spin rounded-full border border-emerald-500 border-t-transparent" />
                                ) : (
                                  <Brain className="h-3 w-3" />
                                )}
                              </Button>
                              {analyzingArticles.has(article.title) && (
                                <span className="text-xs text-emerald-600 font-medium">Analyzing...</span>
                              )}
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
        </>
      )}
    </AppShell>
  );
}
