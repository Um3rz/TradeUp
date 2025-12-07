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
    answer: createLinkText("Search for a stock ticker, enter shares, and click Buy.", "/buy", "Buy Page")
  },
  {
    category: "Trading",
    question: "How do I sell stocks?",
    answer: createLinkText("Find your stock in portfolio, click it, and select Sell.", "/portfolio", "Portfolio")
  },
  {
    category: "Portfolio",
    question: "How do I view my holdings?",
    answer: createLinkText("See all holdings, values, and performance.", "/portfolio", "Portfolio")
  },
  {
    category: "Portfolio",
    question: "How is P&L calculated?",
    answer: "P&L = (Current Price - Purchase Price) × Shares. Green = gains, red = losses."
  },
  {
    category: "Charts",
    question: "How do I view charts?",
    answer: createLinkText("Search any ticker for interactive price charts.", "/charts", "Charts")
  },
  {
    category: "Charts",
    question: "What timeframes are available?",
    answer: "1 day, 5 days, 1 month, 6 months, 1 year, 5 years."
  },
  {
    category: "News",
    question: "How do I access news?",
    answer: createLinkText("Latest financial news and ticker-specific articles.", "/news", "News")
  },
  {
    category: "Settings",
    question: "How do I update my profile?",
    answer: createLinkText("Update name, email, and profile picture.", "/settings", "Settings")
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
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
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