'use client'
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function charts() {
    const [tickData, setTickData] = useState<any>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<any>(null);
    const [candleData, setCandleData] = useState<any[]>([]);
    const [currentCandle, setCurrentCandle] = useState<any>(null);
    const [stock, setStock] = useState<string>('HBL');

    // 4 hours in milliseconds
    const CANDLE_INTERVAL = 1 * 60 * 60 * 1000;

    const getCandleStartTime = (timestamp: number) => {
        return Math.floor(timestamp / CANDLE_INTERVAL) * CANDLE_INTERVAL;
    };

    const initializeChart = () => {
        if (!chartContainerRef.current) return;
        
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 500,
            layout: {
                background: { color: 'transparent' },
                textColor: '#E4E6EB',
            },
            grid: {
                vertLines: { color: '#2D3139' },
                horzLines: { color: '#2D3139' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: '#2D3139',
                rightOffset: 12,
                barSpacing: 6,
                fixLeftEdge: false,
                fixRightEdge: false,
                lockVisibleTimeRangeOnResize: true,
            },
            rightPriceScale: {
                borderColor: '#2D3139',
                scaleMargins: {
                    top: 0.05,
                    bottom: 0.05,
                },
                autoScale: true,
            },
            crosshair: {
                mode: 0, // Normal crosshair mode
                vertLine: {
                    color: '#2D3139',
                    width: 1,
                    style: 2,
                },
                horzLine: {
                    color: '#2D3139', 
                    width: 1,
                    style: 2,
                },
            },
        });
        
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });
        
        chartRef.current = chart;
        candlestickSeriesRef.current = candlestickSeries;

        // Handle resize
        const resizeObserver = new ResizeObserver(entries => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: 500,
                });
            }
        });
        
        if (chartContainerRef.current) {
            resizeObserver.observe(chartContainerRef.current);
        }
        
        return () => {
            resizeObserver.disconnect();
        };
    };

    const processTickData = (tickData: any) => {
        // Extract price from tick data - adjust this based on your actual tick data structure
        const tickTime = new Date().getTime(); // Use current time or tickData.timestamp if available
        const tickPrice = tickData.price || tickData.last || tickData.close || Math.random() * 100 + 50; // Fallback for testing
        
        const candleStartTime = getCandleStartTime(tickTime);
        
        // Check if this tick belongs to current candle or new one
        if (!currentCandle || currentCandle.time !== candleStartTime) {
            // Start new candle
            const newCandle = {
                time: candleStartTime / 1000, // Lightweight charts expects seconds
                open: tickPrice,
                high: tickPrice,
                low: tickPrice,
                close: tickPrice,
            };
            
            if (currentCandle) {
                // Add completed candle to history
                setCandleData(prev => [...prev, currentCandle]);
            }
            
            setCurrentCandle(newCandle);
        } else {
            // Update current candle
            setCurrentCandle((prev: any) => ({
                ...prev,
                high: Math.max(prev.high, tickPrice),
                low: Math.min(prev.low, tickPrice),
                close: tickPrice,
            }));
        }
    };

    useEffect(() => {
        initializeChart();
        
        if (stock) { // Only connect if stock is selected
            // Clear previous data when changing stocks
            setCandleData([]);
            setCurrentCandle(null);
            setTickData(null);
            
            const socket: Socket = io("http://localhost:3001/ws");
            socket.emit("subscribeSymbol", stock);
            
            socket.on("tickUpdate", (data) => {
                setTickData(data);
                processTickData(data);
            });
            
            return () => {
                socket.close();
                if (chartRef.current) {
                    chartRef.current.remove();
                }
            };
        }
    }, [stock]);

    // Update chart when candle data changes
    useEffect(() => {
        if (candlestickSeriesRef.current && candleData.length > 0) {
            candlestickSeriesRef.current.setData(candleData);
        }
    }, [candleData]);

    // Update chart when current candle changes
    useEffect(() => {
        if (candlestickSeriesRef.current && currentCandle) {
            const allData = [...candleData, currentCandle];
            candlestickSeriesRef.current.setData(allData);
        }
    }, [currentCandle, candleData]);

    return (
        <div className="min-h-screen bg-[#111418] p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center">
                    <div><h1 className="text-3xl font-bold text-[#E4E6EB]">Live Trading Charts</h1>
                    <p className="text-[#9BA1A6] mt-2">Real-time 1-hour candlestick chart for {stock || 'No Stock Selected'}</p>
                    </div>
                    <div className="ml-10">
                        <select 
                            value={stock} 
                            onChange={(e)=>setStock(e.target.value)} 
                            name="Stock" 
                            id="Stock"
                            className="bg-[#1C1F24] text-[#E4E6EB] border border-[#2D3139] rounded-lg px-3 py-2 focus:border-[#E4E6EB] focus:outline-none"
                        >
                            <option value="HBL">HBL</option>
                            <option value="UBL">UBL</option>
                            <option value="MCB">MCB</option>
                            <option value="HUBC">HUBC</option>
                            <option value="FFC">FFC</option>
                        </select>
                    </div>
                </div>
                
                <Card className="overflow-hidden bg-[#1C1F24] border-[#2D3139]">
                    <CardContent className="p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-[#E4E6EB] mb-2">{stock || 'No Stock Selected'} - 1H Chart</h2>
                            <div className="flex items-center gap-4 text-sm text-[#9BA1A6]">
                                <span>Completed Candles: {candleData.length}</span>
                                <span>•</span>
                                <span>Status: {stock ? (tickData ? "Connected" : "Waiting for connection...") : "Please select a stock"}</span>
                            </div>
                        </div>
                        
                        <div 
                            ref={chartContainerRef} 
                            className="w-full h-[500px] bg-[#1C1F24] rounded-lg border border-[#2D3139]"
                        />
                    </CardContent>
                </Card>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <Card className="bg-[#1C1F24] border-[#2D3139]">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-medium text-[#E4E6EB] mb-3">Current Candle</h3>
                            <div className="space-y-2">
                                {currentCandle ? (
                                    <div className="font-mono text-sm bg-[#2D3139] p-3 rounded-md">
                                        <div className="grid grid-cols-2 gap-2">
                                            <span className="text-[#9BA1A6]">Open:</span>
                                            <span className="text-[#E4E6EB]">{currentCandle.open?.toFixed(2)}</span>
                                            <span className="text-[#9BA1A6]">High:</span>
                                            <span className="text-green-400">{currentCandle.high?.toFixed(2)}</span>
                                            <span className="text-[#9BA1A6]">Low:</span>
                                            <span className="text-red-400">{currentCandle.low?.toFixed(2)}</span>
                                            <span className="text-[#9BA1A6]">Close:</span>
                                            <span className="text-[#E4E6EB]">{currentCandle.close?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[#9BA1A6]">No active candle</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#1C1F24] border-[#2D3139]">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-medium text-[#E4E6EB] mb-3">Latest Tick Data</h3>
                            <div className="space-y-2">
                                {tickData ? (
                                    <div className="font-mono text-xs bg-[#2D3139] p-3 rounded-md max-h-32 overflow-y-auto">
                                        <pre className="text-[#9BA1A6] whitespace-pre-wrap">
                                            {JSON.stringify(tickData, null, 2)}
                                        </pre>
                                    </div>
                                ) : (
                                    <p className="text-[#9BA1A6]">Waiting for data...</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}