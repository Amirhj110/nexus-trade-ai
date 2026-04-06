const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface StockInfo {
  symbol: string;
  name: string;
  provider?: string;
}

export interface OHLC {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockData {
  symbol: string;
  provider?: string;
  data: OHLC[];
}

export interface KeyDrivers {
  rsi: string;
  ma20: string;
  ma50: string;
  volatility: string;
}

export interface Prediction {
  symbol: string;
  prediction: string;
  probability: number;
  confidence: string;
  drivers: KeyDrivers;
  timestamp: string;
}

export interface PortfolioResult {
  ticker: string;
  ai_strategy_return: number;
  buy_hold_return: number;
  difference: number;
}

const periodMap: Record<string, string> = {
  '1M': '1mo',
  '3M': '3mo',
  '6M': '6mo',
  '1Y': '1y',
};

export async function fetchStocks(): Promise<StockInfo[]> {
  const res = await fetch(`${API_BASE}/api/stocks`);
  if (!res.ok) throw new Error('Failed to fetch stocks');
  const data = await res.json();
  return data.stocks;
}

export async function fetchStockData(ticker: string, period: string = '1Y'): Promise<StockData> {
  const apiPeriod = periodMap[period] || '1y';
  const res = await fetch(`${API_BASE}/api/stock/${ticker}?period=${apiPeriod}`);
  if (!res.ok) throw new Error('Failed to fetch stock data');
  return res.json();
}

export async function fetchPrediction(ticker: string): Promise<Prediction> {
  const res = await fetch(`${API_BASE}/api/predict/${ticker}`);
  if (!res.ok) throw new Error('Failed to fetch prediction');
  return res.json();
}

export async function fetchPortfolio(ticker: string, startBalance: number = 10000): Promise<PortfolioResult> {
  const res = await fetch(`${API_BASE}/api/portfolio/${ticker}?start_balance=${startBalance}`);
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  return res.json();
}

export async function checkHealth(): Promise<{ status: string; providers?: string[] }> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error('Backend not available');
  return res.json();
}