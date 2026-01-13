'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, PiggyBank, Wallet } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { PageHeader, EmptyState } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { http, ApiException } from '@/lib/http';
import { formatUSD, formatPercent, getPnLClass } from '@/lib/format';
import { cn } from '@/lib/utils';

interface PortfolioItem {
  symbol: string;
  name: string | null;
  quantity: number;
  avgPrice: string;
  currentPrice: string;
  invested: string;
  currentValue: string;
  unrealizedPnl: string;
  pnlPercentage: string;
  createdAt: string;
}

interface PortfolioData {
  balance: string;
  totalInvested: string;
  totalPortfolioValue: string;
  totalUnrealizedPnl: string;
  totalPnlPercentage: string;
  totalAccountValue: string;
  portfolio: PortfolioItem[];
}

export default function Portfolio() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sell dialog state
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<PortfolioItem | null>(null);
  const [sellQuantity, setSellQuantity] = useState('');
  const [isSelling, setIsSelling] = useState(false);

  const fetchPortfolio = useCallback(async () => {
    try {
      setError(null);
      const data = await http.get<PortfolioData>('/trades/portfolio');
      setPortfolioData(data);
    } catch (err) {
      const message = err instanceof ApiException ? err.message : 'Failed to fetch portfolio data.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const openSellDialog = (item: PortfolioItem) => {
    setSelectedStock(item);
    setSellQuantity('');
    setSellDialogOpen(true);
  };

  const handleSell = async () => {
    if (!selectedStock) return;
    
    const quantity = Number(sellQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity.');
      return;
    }

    if (quantity > selectedStock.quantity) {
      toast.error('You cannot sell more shares than you own.');
      return;
    }

    setIsSelling(true);
    try {
      await http.post('/trades/sell', { 
        symbol: selectedStock.symbol, 
        quantity 
      });
      
      toast.success(`Successfully sold ${quantity} shares of ${selectedStock.symbol}`);
      setSellDialogOpen(false);
      setLoading(true);
      fetchPortfolio();
    } catch (err) {
      const message = err instanceof ApiException ? err.message : 'Failed to sell stock.';
      toast.error(message);
    } finally {
      setIsSelling(false);
    }
  };

  const totalPnlIsPositive = portfolioData ? parseFloat(portfolioData.totalUnrealizedPnl) >= 0 : true;

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-destructive text-xl">{error}</p>
          <Button className="mt-4" onClick={() => { setLoading(true); fetchPortfolio(); }}>
            Try Again
          </Button>
        </div>
      </AppShell>
    );
  }

  if (!portfolioData) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground text-xl">No data available</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader 
        title="Portfolio" 
        description="Track your investments and performance"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cash Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUSD(portfolioData.balance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUSD(portfolioData.totalInvested)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUSD(portfolioData.totalPortfolioValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Account Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUSD(portfolioData.totalAccountValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* P&L Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Unrealized P&L</p>
              <p className={cn("text-3xl font-bold", totalPnlIsPositive ? 'text-emerald-400' : 'text-rose-400')}>
                {formatUSD(portfolioData.totalUnrealizedPnl)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground mb-1">Return</p>
              <div className="flex items-center gap-2">
                {totalPnlIsPositive ? (
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-rose-400" />
                )}
                <p className={cn("text-3xl font-bold", totalPnlIsPositive ? 'text-emerald-400' : 'text-rose-400')}>
                  {formatPercent(portfolioData.totalPnlPercentage)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolioData.portfolio.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Avg. Price</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">Invested</TableHead>
                  <TableHead className="text-right">Current Value</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-right">P&L %</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolioData.portfolio.map((item) => {
                  const pnlIsPositive = parseFloat(item.unrealizedPnl) >= 0;
                  return (
                    <TableRow key={item.symbol}>
                      <TableCell className="font-semibold">{item.symbol}</TableCell>
                      <TableCell className="text-muted-foreground">{item.name || '-'}</TableCell>
                      <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatUSD(item.avgPrice)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatUSD(item.currentPrice)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatUSD(item.invested)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatUSD(item.currentValue)}</TableCell>
                      <TableCell className={cn("text-right tabular-nums font-semibold", pnlIsPositive ? 'text-emerald-400' : 'text-rose-400')}>
                        {formatUSD(item.unrealizedPnl)}
                      </TableCell>
                      <TableCell className={cn("text-right tabular-nums font-semibold", pnlIsPositive ? 'text-emerald-400' : 'text-rose-400')}>
                        {formatPercent(item.pnlPercentage)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openSellDialog(item)}
                        >
                          Sell
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState 
              variant="portfolio"
              action={{
                label: "Start Trading",
                onClick: () => window.location.href = '/buy'
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Sell Dialog */}
      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sell {selectedStock?.symbol}</DialogTitle>
            <DialogDescription>
              You own {selectedStock?.quantity} shares. Enter how many you want to sell.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="Enter quantity"
              value={sellQuantity}
              onChange={(e) => setSellQuantity(e.target.value)}
              min="1"
              max={selectedStock?.quantity}
            />
            {selectedStock && sellQuantity && Number(sellQuantity) > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Estimated proceeds: {formatUSD(Number(sellQuantity) * parseFloat(selectedStock.currentPrice))}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSellDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSell}
              disabled={isSelling || !sellQuantity || Number(sellQuantity) <= 0}
            >
              {isSelling ? 'Selling...' : 'Confirm Sell'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
