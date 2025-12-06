"use client";
import React, { useState } from "react";
import TopBar from '@/components/topbar';
import { useUser } from '@/context/UserContext';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const createLinkText = (text: string, href: string, linkText: string) => 
  `${text} <a href='${href}' class='text-blue-400 hover:text-blue-300 underline'>${linkText}</a>.`;

const FAQ_DATA: FAQItem[] = [
  {
    category: "Trading",
    question: "How do I buy stocks?",
    answer: createLinkText(
      "Navigate to the 'Buy' page, search for a stock ticker (e.g., AAPL), enter the number of shares you want to purchase, and click 'Buy'. Make sure you have sufficient balance in your account. You can access the buy page directly here:",
      "/buy",
      "Buy Stocks"
    )
  },
  {
    category: "Trading",
    question: "How do I sell stocks?",
    answer: createLinkText(
      "Go to your 'Portfolio' page, find the stock you want to sell, click on it, and select 'Sell'. Choose how many shares to sell and confirm the transaction. Access your portfolio here:",
      "/portfolio", 
      "My Portfolio"
    )
  },
  {
    category: "Trading",
    question: "Are trades executed in real-time?",
    answer: "Yes, trades are executed using real-time market data. However, since this is a simulation, you're not actually buying real stocks - just practicing with virtual money."
  },
  {
    category: "Trading", 
    question: "What types of orders can I place?",
    answer: "Currently, TradeUp supports market orders, which execute immediately at the current market price. Additional order types may be added in future updates."
  },
  {
    category: "Portfolio & Watchlist",
    question: "How do I view my portfolio?",
    answer: createLinkText(
      "Click on 'Portfolio' in the navigation menu to see all your current holdings, their current values, profit/loss, and overall portfolio performance.",
      "/portfolio",
      "Go to Portfolio"
    )
  },
  {
    category: "Portfolio & Watchlist",
    question: "What is a watchlist and how do I use it?", 
    answer: "A watchlist lets you track stocks you're interested in without buying them. Add stocks to your watchlist to monitor their prices and performance over time."
  },
  {
    category: "Portfolio & Watchlist",
    question: "How is profit and loss calculated?",
    answer: "P&L is calculated as (Current Price - Purchase Price) × Number of Shares. Green indicates gains, red indicates losses. Your total portfolio P&L is the sum of all individual stock P&L."
  },
  {
    category: "Charts & Data",
    question: "How do I view stock charts?",
    answer: createLinkText(
      "Go to the 'Charts' page and search for any stock ticker. You'll see interactive charts with price history, volume data, and technical indicators.",
      "/charts",
      "View Charts"
    )
  },
  {
    category: "Charts & Data",
    question: "What chart timeframes are available?",
    answer: "Charts support multiple timeframes including 1 day, 5 days, 1 month, 6 months, 1 year, and 5 years to help you analyze both short-term and long-term trends."
  },
  {
    category: "Charts & Data", 
    question: "Where does the market data come from?",
    answer: "TradeUp uses real-time market data from reliable financial data providers to ensure accurate pricing and chart information."
  },
  {
    category: "News & Research",
    question: "How do I access market news?",
    answer: createLinkText(
      "Visit the 'News' page to see the latest financial news. You can also search for news specific to any stock ticker you're interested in.",
      "/news",
      "Read News"
    )
  },
  {
    category: "News & Research",
    question: "Can I search for news about specific stocks?",
    answer: "Yes! On the News page, use the search bar to enter a stock ticker (like TSLA or MSFT) to see news articles specifically related to that company."
  },
  {
    category: "Account & Settings",
    question: "How do I update my profile information?",
    answer: createLinkText(
      "Go to 'Settings' in your account menu to update your name, email, profile picture, and other account preferences.",
      "/settings",
      "Access Settings"
    )
  },
  {
    category: "Account & Settings",
    question: "How do I change my password?",
    answer: "In the Settings page, you'll find a 'Change Password' section where you can update your password. Make sure to use a strong, unique password."
  },
  {
    category: "Account & Settings",
    question: "Can I reset my virtual balance?",
    answer: "Currently, account balances cannot be reset. This encourages realistic trading practice. If you need assistance, contact support."
  },
  {
    category: "General Questions",
    question: "Is TradeUp suitable for beginners?",
    answer: "Absolutely! TradeUp is designed as a learning platform where beginners can practice trading with virtual money before risking real capital in actual markets."
  },
  {
    category: "General Questions", 
    question: "Do I need any trading experience to use TradeUp?",
    answer: "No prior experience is required. TradeUp is perfect for learning the basics of stock trading, portfolio management, and market analysis in a risk-free environment."
  },
  {
    category: "General Questions",
    question: "Is my personal information secure?",
    answer: "Yes, we take security seriously. Your personal information is encrypted and stored securely. We never share your data with third parties without your consent."
  }
];

const CATEGORIES = Array.from(new Set(FAQ_DATA.map(item => item.category)));

const LoadingScreen = () => (
  <div className='min-h-screen bg-[#0F1419] flex items-center justify-center'>
    <span className='text-white text-xl'>Loading...</span>
  </div>
);

const CategoryButton = ({ category, isActive, onClick }: { 
  category: string; 
  isActive: boolean; 
  onClick: () => void; 
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-[#23262b] hover:text-white'
    }`}
  >
    {category}
  </button>
);

const FAQItemComponent = ({ faq, index, isExpanded, onToggle }: {
  faq: FAQItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) => (
  <div className="border border-[#23262b] rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-[#0F1419] hover:bg-[#23262b] transition-colors text-left"
    >
      <h3 className="font-semibold text-white">{faq.question}</h3>
      <span className="text-gray-400 flex-shrink-0 text-xl">
        {isExpanded ? '−' : '+'}
      </span>
    </button>
    
    {isExpanded && (
      <div className="p-4 bg-[#181B20] border-t border-[#23262b]">
        <div 
          className="text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: faq.answer }}
        />
      </div>
    )}
  </div>
);

export default function HelpPage() {
  const { user, isLoading } = useUser();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const filteredFAQs = FAQ_DATA.filter(item => item.category === activeCategory);

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  if (isLoading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      <TopBar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Help & FAQ</h1>
          <p className="text-gray-300 text-lg">
            Find answers to common questions and learn how to make the most of TradeUp
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-[#181B20] rounded-lg border border-[#23262b] p-4 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <CategoryButton
                    key={category}
                    category={category}
                    isActive={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:w-3/4">
            <div className="bg-[#181B20] rounded-lg border border-[#23262b] p-6">
              <h2 className="text-2xl font-bold mb-6 text-blue-400">{activeCategory}</h2>
              
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <FAQItemComponent
                    key={`${activeCategory}-${index}`}
                    faq={faq}
                    index={index}
                    isExpanded={expandedItems.has(index)}
                    onToggle={() => toggleExpanded(index)}
                  />
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg border border-blue-500 p-6">
              <h3 className="text-xl font-bold mb-2">Still need help?</h3>
              <p className="text-blue-100 mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                  Contact Support
                </button>
                <button className="border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
                  Email Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}