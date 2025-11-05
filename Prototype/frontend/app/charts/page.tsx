'use client'
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import TopBar from "@/components/topbar"

export default function charts() {
    const [tickData, setTickData] = useState<any>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<any>(null);
    const [candleData, setCandleData] = useState<any[]>([]);
    const [currentCandle, setCurrentCandle] = useState<any>(null);
    const [stock, setStock] = useState<string>('HBL');

    // 1 minute in milliseconds
    const CANDLE_INTERVAL = 1 * 60 * 1000;

    const getCandleStartTime = (timestamp: number) => {
        return Math.floor(timestamp / CANDLE_INTERVAL) * CANDLE_INTERVAL;
    };

    const clearCandleHistory = () => {
        if (confirm(`Are you sure you want to clear all candle history for ${stock}?`)) {
            setCandleData([]);
            setCurrentCandle(null);
            try {
                localStorage.removeItem(`candles_${stock}`);
                console.log(`Cleared candle history for ${stock}`);
            } catch (error) {
                console.error('Failed to clear candles from localStorage:', error);
            }
        }
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

    useEffect(() => {
        initializeChart();
        
        if (stock) { // Only connect if stock is selected
            // Load previous candles from localStorage when stock changes
            try {
                const storedCandles = localStorage.getItem(`candles_${stock}`);
                if (storedCandles) {
                    const parsed = JSON.parse(storedCandles);
                    setCandleData(parsed);
                    console.log(`Loaded ${parsed.length} previous candles for ${stock}`);
                } else {
                    setCandleData([]);
                }
            } catch (error) {
                console.error('Failed to load candles from localStorage:', error);
                setCandleData([]);
            }
            
            setCurrentCandle(null);
            setTickData(null);
            
            const socket: Socket = io("http://localhost:3001/ws");
            socket.emit("subscribeSymbol", stock);
            
            socket.on("tickUpdate", (data) => {
                setTickData(data);
                
                // Process tick data inline to avoid closure issues
                const tick = data.tick;
                if (!tick) return;
                
                const tickTime = data.timestamp || new Date().getTime();
                const candleStartTime = getCandleStartTime(tickTime);
                const candleTimeInSeconds = candleStartTime / 1000;
                
                setCurrentCandle((prev: any) => {
                    // Check if we need to start a new candle
                    if (!prev || prev.time !== candleTimeInSeconds) {
                        // Save the previous candle if it exists
                        if (prev) {
                            setCandleData(oldData => {
                                // Check if this candle already exists in the data
                                const exists = oldData.some(candle => candle.time === prev.time);
                                if (exists) {
                                    console.log('Candle already exists, skipping duplicate');
                                    return oldData;
                                }
                                
                                const updated = [...oldData, prev];
                                // Save to localStorage
                                try {
                                    localStorage.setItem(`candles_${stock}`, JSON.stringify(updated));
                                    console.log(`Saved candle at time ${prev.time}. Total: ${updated.length}`);
                                } catch (error) {
                                    console.error('Failed to save candles to localStorage:', error);
                                }
                                return updated;
                            });
                        }
                        
                        // Return new candle
                        return {
                            time: candleTimeInSeconds,
                            open: tick.o,
                            high: tick.h,
                            low: tick.l,
                            close: tick.c,
                        };
                    } else {
                        // Update current candle
                        return {
                            ...prev,
                            high: Math.max(prev.high, tick.h),
                            low: Math.min(prev.low, tick.l),
                            close: tick.c,
                        };
                    }
                });
            });
            
            return () => {
                socket.close();
                if (chartRef.current) {
                    chartRef.current.remove();
                }
            };
        }
    }, [stock]);

    // Update chart with all data (completed candles + current candle)
    useEffect(() => {
        if (candlestickSeriesRef.current) {
            const allData = currentCandle 
                ? [...candleData, currentCandle]
                : candleData;
            
            if (allData.length > 0) {
                // Sort data by time to ensure ascending order
                const sortedData = [...allData].sort((a, b) => a.time - b.time);
                
                // Remove duplicates by keeping the last occurrence of each timestamp
                const uniqueData = sortedData.reduce((acc: any[], candle) => {
                    const existingIndex = acc.findIndex(c => c.time === candle.time);
                    if (existingIndex >= 0) {
                        acc[existingIndex] = candle; // Replace with newer data
                    } else {
                        acc.push(candle);
                    }
                    return acc;
                }, []);
                
                candlestickSeriesRef.current.setData(uniqueData);
            }
        }
    }, [candleData, currentCandle]);

    return (
        <div className="min-h-screen bg-[#111418]">
            <TopBar/>
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center">
                    <div><h1 className="text-3xl font-bold text-[#E4E6EB]">Live Trading Charts</h1>
                    <p className="text-[#9BA1A6] mt-2">Real-time 1-minute candlestick chart for {stock || 'No Stock Selected'}</p>
                    </div>
                    <div className="ml-10 flex items-center gap-4">
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
                        <button
                            onClick={clearCandleHistory}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Clear History
                        </button>
                    </div>
                </div>
                
                <Card className="overflow-hidden bg-[#1C1F24] border-[#2D3139]">
                    <CardContent className="p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-[#E4E6EB] mb-2">{stock || 'No Stock Selected'} - 1M Chart</h2>
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
                                            <span className="text-[#9BA1A6]">Current Price:</span>
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