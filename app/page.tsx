'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import StockChart from '@/components/StockChart';
import AIInsight from '@/components/AIInsight';
import Portfolio from '@/components/Portfolio';
import {
  fetchStocks,
  fetchStockData,
  fetchPrediction,
  fetchPortfolio,
  StockInfo,
  Prediction,
  PortfolioResult,
  OHLC,
} from '@/lib/api';

const DEFAULT_STOCK = 'NVDA';
const DEFAULT_PERIOD = '1Y';

export default function Home() {
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [selectedStock, setSelectedStock] = useState(DEFAULT_STOCK);
  const [selectedPeriod, setSelectedPeriod] = useState(DEFAULT_PERIOD);
  const [stockData, setStockData] = useState<OHLC[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResult | null>(null);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStockData = useCallback(async (ticker: string, period: string) => {
    setLoadingChart(true);
    setLoadingPrediction(true);
    setLoadingPortfolio(true);
    setError(null);
    try {
      const [stockDataRes, predictionRes, portfolioRes] = await Promise.all([
        fetchStockData(ticker, period),
        fetchPrediction(ticker),
        fetchPortfolio(ticker),
      ]);
      setStockData(stockDataRes.data);
      setPrediction(predictionRes);
      setPortfolio(portfolioRes);
    } catch (err) {
      console.error('Failed to fetch stock data:', err);
      setError('Failed to load stock data. Please try again later.');
    } finally {
      setLoadingChart(false);
      setLoadingPrediction(false);
      setLoadingPortfolio(false);
    }
  }, []);

  useEffect(() => {
    async function loadStocks() {
      try {
        const data = await fetchStocks();
        setStocks(data);
      } catch (err) {
        console.error('Failed to fetch stocks:', err);
        setError('Failed to load stocks. Please try again later.');
      } finally {
        setLoadingStocks(false);
      }
    }
    loadStocks();
  }, []);

  useEffect(() => {
    if (stocks.length > 0) {
      loadStockData(selectedStock, selectedPeriod);
    }
  }, [stocks, selectedStock, selectedPeriod, loadStockData]);

  const handleStockChange = (symbol: string) => {
    setSelectedStock(symbol);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <Header
        stocks={stocks}
        selectedStock={selectedStock}
        onStockChange={handleStockChange}
        loading={loadingStocks}
      />

      <main className="p-4 lg:p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2">
            <StockChart
              data={stockData}
              ticker={selectedStock}
              loading={loadingChart}
              period={selectedPeriod}
              onPeriodChange={handlePeriodChange}
            />
          </div>

          <div className="space-y-4 lg:space-y-6">
            <AIInsight
              prediction={prediction}
              loading={loadingPrediction}
            />
            <Portfolio
              portfolio={portfolio}
              loading={loadingPortfolio}
            />
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-[#374151] bg-[#111827]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2 text-sm text-[#94a3b8]">
          <p>
            Data provided by Yahoo Finance. Not financial advice.
          </p>
          <p className="text-xs">
            Nexus Trade AI © 2024 | Decision Support Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
}