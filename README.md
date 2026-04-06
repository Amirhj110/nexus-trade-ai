# Nexus Trade AI

A Decision Support Dashboard for stock market visualization and AI-powered trend forecasting.

## Quick Start

### 1. Install Dependencies

**Backend:**
```powershell
cd backend
pip install -r requirements.txt
```

**Frontend:**
```powershell
npm install
```

### 2. Run the Application

**Start Backend (Terminal 1):**
```powershell
cd backend
python main.py
```
Backend runs at http://localhost:8000

**Start Frontend (Terminal 2):**
```powershell
npm run dev
```
Frontend runs at http://localhost:3000

### 3. Open Dashboard

Navigate to http://localhost:3000 in your browser.

## Features

- **Stock Selector**: Dropdown with 8 major stocks (AAPL, MSFT, NVDA, GOOGL, AMZN, TSLA, META, ^KSE)
- **Interactive Chart**: TradingView-style candlestick chart with volume
- **AI Insight Panel**: Next-day prediction with confidence score and key drivers (RSI, MA20, MA50, Volatility)
- **Portfolio Simulator**: $10k starting balance comparing AI strategy vs Buy & Hold

## API Endpoints

- `GET /api/stocks` - List available stocks
- `GET /api/stock/{ticker}` - Get OHLCV data
- `GET /api/predict/{ticker}` - Get AI prediction
- `GET /api/portfolio/{ticker}` - Get portfolio simulation

## Tech Stack

- **Backend**: FastAPI + Python, yfinance for market data
- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Charting**: Lightweight Charts (TradingView)

## Available Stocks

| Symbol | Company |
|--------|---------|
| AAPL | Apple Inc. |
| MSFT | Microsoft Corporation |
| NVDA | NVIDIA Corporation |
| GOOGL | Alphabet Inc. |
| AMZN | Amazon.com Inc. |
| TSLA | Tesla Inc. |
| META | Meta Platforms Inc. |
| ^KSE | KSE 100 Index (Pakistan) |

## Notes

- Data is fetched live from Yahoo Finance
- The prediction algorithm is a simple moving average (SMA) mock for Phase 1
- Portfolio simulation uses a basic strategy: buy when AI predicts UP, sell when DOWN
- This is for educational/decision-support purposes, not financial advice