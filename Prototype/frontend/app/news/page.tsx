"use client";
import React, { useState, useEffect, useCallback } from "react";
import TopBar from '@/components/topbar';
import Image from 'next/image';
import { fetchLatestNews, fetchStockNews } from '@/lib/newsService';
import { NewsArticle, StockNewsArticle } from '@/types/news';
import { useUser } from "@/context/UserContext";

export default function NewsPage() {
  const { user, isLoading: userLoading } = useUser();
  
  const [generalArticles, setGeneralArticles] = useState<NewsArticle[]>([]);
  const [stockArticles, setStockArticles] = useState<StockNewsArticle[]>([]);
  const [searchTicker, setSearchTicker] = useState<string>('');
  const [lastSearchedTicker, setLastSearchedTicker] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);



  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const loadLatestNews = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      setIsSearching(false);
      setStockArticles([]);
      
      const newsArticles = await fetchLatestNews();
      setGeneralArticles(newsArticles);
    } catch (err) {
      setError('Failed to load news');
      console.error('Error fetching latest news:', err);
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
      
      const searchedStockArticles = await fetchStockNews(ticker.toUpperCase());
      setStockArticles(searchedStockArticles);
      
      const latestNews = await fetchLatestNews();
      setGeneralArticles(latestNews);
    } catch (err) {
      setError('Failed to load stock news');
      console.error('Error fetching stock news:', err);
      setSearchLoading(false);
    }
  }, [loadLatestNews]);

  // Clear search loading when articles are fetched
  useEffect(() => {
    if (isSearching && (stockArticles.length > 0 || generalArticles.length > 0)) {
      setSearchLoading(false);
    }
  }, [stockArticles, generalArticles, isSearching]);

  const handleInputChange = (value: string): void => {
    setSearchTicker(value);
  };

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

  // Full-screen loading before user is loaded or initial data load
  if (userLoading || !user || loading) {
    return (
      <div className='min-h-screen bg-[#0F1419] flex items-center justify-center'>
        <span className='text-white text-xl'>Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      <TopBar />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold mb-8">Market News</h1>
        
        <form onSubmit={handleSearchSubmit} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchTicker}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Search ticker (e.g., AAPL)"
              className="flex-1 bg-[#181B20] border border-[#23262b] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {searchLoading && (
          <div className="text-sm text-blue-400 mb-6 flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            Searching for {searchTicker.toUpperCase()}...
          </div>
        )}

        <div>
          {error ? (
            <div className="text-red-500 text-center py-8 bg-red-900 bg-opacity-20 rounded-lg border border-red-500 mb-8">
              {error}
            </div>
          ) : (
            <div>
              {isSearching && stockArticles.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 text-blue-400">
                    {lastSearchedTicker} News
                  </h2>
                  <div className="grid gap-6">
                    {stockArticles.map((article: StockNewsArticle, index: number) => (
                      <a
                        key={`stock-${index}-${article.title}`}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-[#181B20] border border-[#23262b] rounded-lg overflow-hidden hover:border-blue-500 transition-all duration-300 flex"
                      >
                        {article.image_url && (
                          <div className="w-64 h-48 flex-shrink-0 overflow-hidden bg-[#0F1419]">
                            <Image
                              src={article.image_url}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="p-6 flex flex-col justify-between flex-1">
                          <div>
                            <h3 className="font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-gray-300 text-sm line-clamp-3">
                              {article.description}
                            </p>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-[#23262b]">
                            <p className="text-xs text-gray-500">
                              {formatDate(article.published_at)}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {isSearching ? 'General News' : 'Latest News'}
                </h2>
                {generalArticles.length === 0 ? (
                  <div className="text-gray-400 text-center py-8 bg-[#181B20] rounded-lg border border-[#23262b]">
                    No articles found
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {generalArticles.map((article: NewsArticle, index: number) => (
                      <a
                        key={`general-${index}-${article.title}`}
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-[#181B20] border border-[#23262b] rounded-lg overflow-hidden hover:border-blue-500 transition-all duration-300 flex"
                      >
                        {article.image && (
                          <div className="w-64 h-48 flex-shrink-0 overflow-hidden bg-[#0F1419]">
                            <Image
                              src={article.image}
                              alt={article.title}
                              width={256}
                              height={192}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="p-6 flex flex-col justify-between flex-1">
                          <div>
                            <div className="flex justify-between items-start gap-3 mb-3">
                              <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
                                {article.title}
                              </h3>
                              <p className="text-xs text-gray-400 whitespace-nowrap font-medium flex-shrink-0">
                                {formatDateTime(article.date)}
                              </p>
                            </div>
                            <div className="text-gray-300 text-sm line-clamp-3" dangerouslySetInnerHTML={{ __html: article.content }} />
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-[#23262b]">
                            <p className="text-xs text-gray-500">
                              {formatDate(article.date)}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
