// Serverless API - All data fetched directly from Yahoo Finance, calculations done client-side

export interface StockInfo {
  symbol: string;
  name: string;
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

// Static stock list
const STOCKS: StockInfo[] = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: '^KSE', name: 'KSE 100 Index (Pakistan)' },
];

const periodMap: Record<string, string> = {
  '1M': '1mo',
  '3M': '3mo',
  '6M': '6mo',
  '1Y': '1y',
};

// Yahoo Finance interval mapping
const intervalMap: Record<string, string> = {
  '1M': '1d',
  '3M': '1d',
  '6M': '1d',
  '1Y': '1d',
};

export function fetchStocks(): Promise<StockInfo[]> {
  return Promise.resolve(STOCKS);
}

export async function fetchStockData(ticker: string, period: string = '1Y'): Promise<StockData> {
  const yahooPeriod = periodMap[period] || '1y';
  const interval = intervalMap[period] || '1d';
  
  // Yahoo Finance chart API (CORS-enabled)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?period1=${getPeriodStart(yahooPeriod)}&period2=${Math.floor(Date.now() / 1000)}&interval=${interval}&events=history&includeAdjustedClose=true`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch stock data: ${res.status}`);
  
  const json = await res.json();
  
  if (!json.chart?.result?.[0]) {
    throw new Error('Invalid data format from Yahoo Finance');
  }
  
  const result = json.chart.result[0];
  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0] || {};
  const adjclose = result.indicators?.adjclose?.[0]?.adjclose || quote.close || [];
  
  const ohlcData: OHLC[] = [];
  
  for (let i = 0; i < timestamps.length; i++) {
    if (quote.open?.[i] != null && quote.high?.[i] != null && quote.low?.[i] != null && adjclose?.[i] != null) {
      const date = new Date(timestamps[i] * 1000);
      const timeStr = date.toISOString().split('T')[0];
      
      ohlcData.push({
        time: timeStr,
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: adjclose[i],
        volume: quote.volume?.[i] || 0,
      });
    }
  }
  
  return {
    symbol: ticker,
    data: ohlcData,
  };
}

function getPeriodStart(period: string): number {
  const now = Math.floor(Date.now() / 1000);
  const days: Record<string, number> = {
    '1mo': 30,
    '3mo': 90,
    '6mo': 180,
    '1y': 365,
  };
  return now - (days[period] || 365) * 24 * 60 * 60;
}

// Calculate Simple Moving Average
function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0;
  const sum = data.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

// Calculate RSI (Relative Strength Index)
function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = closes[closes.length - period - 1 + i] - closes[closes.length - period - 2 + i];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Calculate Volatility (standard deviation)
function calculateVolatility(closes: number[], period: number = 20): number {
  if (closes.length < period) return 0;
  const recent = closes.slice(-period);
  const mean = recent.reduce((a, b) => a + b, 0) / period;
  const variance = recent.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
  return Math.sqrt(variance);
}

export async function fetchPrediction(ticker: string): Promise<Prediction> {
  const stockData = await fetchStockData(ticker, '1Y');
  const closes = stockData.data.map(d => d.close);
  
  if (closes.length < 50) {
    throw new Error('Insufficient data for prediction');
  }
  
  const currentPrice = closes[closes.length - 1];
  const ma20 = calculateSMA(closes, 20);
  const ma50 = calculateSMA(closes, 50);
  const rsi = calculateRSI(closes, 14);
  const volatility = calculateVolatility(closes, 20);
  
  // Prediction algorithm based on SPEC.md
  let prediction: string;
  let probability: number;
  let confidence: string;
  
  if (ma20 > ma50 && rsi < 70) {
    prediction = 'UP';
    probability = 75 + Math.random() * 15;
    confidence = 'HIGH';
  } else if (ma20 < ma50 && rsi > 30) {
    prediction = 'DOWN';
    probability = 75 + Math.random() * 15;
    confidence = 'HIGH';
  } else if (currentPrice > ma20) {
    prediction = 'UP';
    probability = 55 + Math.random() * 15;
    confidence = 'MEDIUM';
  } else {
    prediction = 'DOWN';
    probability = 55 + Math.random() * 15;
    confidence = 'MEDIUM';
  }
  
  // Key drivers
  const drivers: KeyDrivers = {
    rsi: rsi > 70 ? 'OVERBOUGHT' : rsi < 30 ? 'OVERSOLD' : 'NEUTRAL',
    ma20: currentPrice > ma20 ? 'ABOVE_PRICE' : 'BELOW_PRICE',
    ma50: currentPrice > ma50 ? 'ABOVE_PRICE' : 'BELOW_PRICE',
    volatility: volatility > currentPrice * 0.03 ? 'HIGH' : 'LOW',
  };
  
  return {
    symbol: ticker,
    prediction,
    probability: Math.round(probability),
    confidence,
    drivers,
    timestamp: new Date().toISOString(),
  };
}

export async function fetchPortfolio(ticker: string, startBalance: number = 10000): Promise<PortfolioResult> {
  const stockData = await fetchStockData(ticker, '1Y');
  const data = stockData.data;
  
  if (data.length < 30) {
    throw new Error('Insufficient data for portfolio simulation');
  }
  
  // Get predictions for each day (using 30-day rolling window)
  const predictions: string[] = [];
  for (let i = 30; i < data.length; i++) {
    const closes = data.slice(0, i).map(d => d.close);
    const ma20 = calculateSMA(closes, 20);
    const ma50 = calculateSMA(closes, 50);
    const rsi = calculateRSI(closes, 14);
    
    if (ma20 > ma50 && rsi < 70) {
      predictions.push('UP');
    } else if (ma20 < ma50 && rsi > 30) {
      predictions.push('DOWN');
    } else if (closes[closes.length - 1] > ma20) {
      predictions.push('UP');
    } else {
      predictions.push('DOWN');
    }
  }
  
  // AI Strategy: Buy when UP, sell when DOWN
  let cash = startBalance;
  let shares = 0;
  
  for (let i = 0; i < predictions.length && i < data.length - 30; i++) {
    const price = data[i + 30].close;
    
    if (predictions[i] === 'UP' && cash > 0) {
      // Buy with all cash
      shares = cash / price;
      cash = 0;
    } else if (predictions[i] === 'DOWN' && shares > 0) {
      // Sell all shares
      cash = shares * price;
      shares = 0;
    }
  }
  
  // Final value
  const finalPrice = data[data.length - 1].close;
  const aiFinalValue = cash + (shares * finalPrice);
  
  // Buy & Hold: Buy at start, hold until end
  const startPrice = data[30].close;
  const buyHoldShares = startBalance / startPrice;
  const buyHoldFinalValue = buyHoldShares * finalPrice;
  
  const aiReturn = ((aiFinalValue - startBalance) / startBalance) * 100;
  const buyHoldReturn = ((buyHoldFinalValue - startBalance) / startBalance) * 100;
  
  return {
    ticker,
    ai_strategy_return: parseFloat(aiReturn.toFixed(2)),
    buy_hold_return: parseFloat(buyHoldReturn.toFixed(2)),
    difference: parseFloat((aiReturn - buyHoldReturn).toFixed(2)),
  };
}

export async function checkHealth(): Promise<{ status: string }> {
  return { status: 'ok (serverless)' };
}