"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { AppShell } from "@/components/layout";
import { PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { http, ApiException } from "@/lib/http";
import { formatDecimal, getPnLClass } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Tick {
  price: number;
  change: number;
}

interface StockData {
  symbol: string;
  name?: string;
  marketType?: string;
  tick?: Tick;
}

export default function BuyPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [showBuyPanel, setShowBuyPanel] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchAllStocks = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await http.get<StockData[]>("/stocks/featured");
      setStocks(data);
    } catch (err) {
      const message = err instanceof ApiException ? err.message : "Failed to load stocks";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStocks();
  }, [fetchAllStocks]);

  useEffect(() => {
    if (selectedStock && quantity > 0) {
      setTotalPrice(getPrice(selectedStock.tick) * quantity);
    } else {
      setTotalPrice(0);
    }
  }, [selectedStock, quantity]);

  const handleStockSelect = (stock: StockData): void => {
    setSelectedStock(stock);
    setShowBuyPanel(true);
    setQuantity(0);
    setTotalPrice(0);
  };

  const handleQuantityChange = (value: string): void => {
    const numValue = parseInt(value) || 0;
    setQuantity(numValue);
  };

  const handleBuySubmit = async (): Promise<void> => {
    if (!selectedStock || quantity <= 0 || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      await http.post("/trades/buy", {
        symbol: selectedStock.symbol,
        quantity: quantity,
      });

      toast.success(`Successfully bought ${quantity} shares of ${selectedStock.symbol}!`);
      closeBuyPanel();
    } catch (err) {
      const message = err instanceof ApiException ? err.message : "Failed to place buy order. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeBuyPanel = (): void => {
    setShowBuyPanel(false);
    setSelectedStock(null);
    setQuantity(0);
    setTotalPrice(0);
  };

  if (error) {
    return (
      <AppShell>
        <div className="flex flex-col justify-center items-center h-96 gap-4">
          <p className="text-xl text-destructive">{error}</p>
          <Button onClick={fetchAllStocks}>Try Again</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell fullWidth>
      <div className="max-w-7xl mx-auto px-6">
        <PageHeader
          title="Trade"
          description="Buy stocks from the Pakistan Stock Exchange"
        />
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Side - Stock List (70%) */}
        <div className="w-[70%] p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Available Stocks</h2>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {stocks.map((stock) => {
                const price = getPrice(stock.tick);
                const { change, changePercent } = getChange(stock.tick);
                const isPositive = change >= 0;

                return (
                  <Card
                    key={stock.symbol}
                    onClick={() => handleStockSelect(stock)}
                    className="cursor-pointer transition-colors hover:bg-accent/50"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-semibold">{stock.symbol}</h3>
                          <p className="text-muted-foreground">{stock.name || stock.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">PKR {formatDecimal(price)}</p>
                          <p className={cn("text-sm flex items-center justify-end gap-1", getPnLClass(change))}>
                            {isPositive ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {change >= 0 ? "+" : ""}{formatDecimal(change)} ({formatDecimal(changePercent)}%)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side - Buy Panel (30%) */}
        <div
          className={cn(
            "w-[30%] bg-card border-l border-border transition-transform duration-300 ease-in-out h-full",
            showBuyPanel ? "transform translate-x-0" : "transform translate-x-full"
          )}
        >
          {selectedStock && (
            <div className="p-6 w-full max-h-full flex flex-col">
              {/* Close Button */}
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeBuyPanel}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Stock Details */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{selectedStock.symbol}</h2>
                <p className="text-muted-foreground mb-4">{selectedStock.name}</p>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-3xl font-bold">PKR {formatDecimal(getPrice(selectedStock.tick))}</p>
                    <p className={cn("text-sm", getPnLClass(getChange(selectedStock.tick).change))}>
                      {getChange(selectedStock.tick).change >= 0 ? "+" : ""}
                      {formatDecimal(getChange(selectedStock.tick).change)}
                      ({formatDecimal(getChange(selectedStock.tick).changePercent)}%)
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quantity Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={quantity || ""}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              {/* Total Price Display */}
              <div className="mb-6">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-3xl font-bold text-primary">
                      PKR {formatDecimal(totalPrice)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Buy Button */}
              <div className="mt-auto">
                <Button
                  onClick={handleBuySubmit}
                  disabled={!selectedStock || quantity <= 0 || isSubmitting}
                  className="w-full py-6 text-lg"
                  size="lg"
                >
                  {isSubmitting ? "Processing..." : `Buy ${quantity > 0 ? `${quantity} Shares` : "Shares"}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function getPrice(tick: Tick | null | undefined): number {
  if (!tick) return 0;
  return tick.price || 0;
}

function getChange(tick: Tick | null | undefined): { change: number; changePercent: number } {
  if (!tick) return { change: 0, changePercent: 0 };
  const change = tick.change || 0;
  const changePercent = tick.price ? (change / (tick.price - change)) * 100 : 0;
  return { change, changePercent };
}
