# Nexus Trade AI - Specification Document

## 1. Project Overview

**Project Name:** Nexus Trade AI  
**Project Type:** Web-based Decision Support Dashboard  
**Core Functionality:** Stock market visualization with AI-powered trend forecasting and simulated portfolio tracking  
**Target Users:** Retail investors seeking data-driven decision support for stock trading

---

## 2. Technical Architecture

### Backend Stack
- **Framework:** FastAPI (Python)
- **Data Source:** yfinance library for real market data
- **ML Model:** Mocked (simple moving average algorithm for Phase 1)
- **API Design:** RESTful endpoints

### Frontend Stack
- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS (Dark Fintech Theme)
- **Charting:** Lightweight Charts (TradingView)
- **State Management:** React hooks + Context API
- **HTTP Client:** Fetch API

### Data Flow
```
yfinance API → FastAPI Backend → /api/predict/{ticker} → React Frontend → Lightweight Charts + UI
```

---

## 3. UI/UX Specification

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Background Primary | Deep Navy | #0a0e17 |
| Background Secondary | Dark Slate | #111827 |
| Background Card | Charcoal | #1f2937 |
| Accent Primary | Electric Cyan | #00d4ff |
| Accent Secondary | Neon Green | #00ff88 |
| Accent Negative | Signal Red | #ff4757 |
| Accent Warning | Gold | #ffd93d |
| Text Primary | Pure White | #ffffff |
| Text Secondary | Silver | #94a3b8 |
| Border | Slate | #374151 |

### Typography
- **Font Family:** "JetBrains Mono" for numbers, "Inter" for UI text
- **Headings:** 
  - H1: 32px, Bold, #ffffff
  - H2: 24px, Semi-bold, #ffffff
  - H3: 18px, Medium, #ffffff
- **Body:** 14px, Regular, #94a3b8
- **Numbers/Data:** 16px, JetBrains Mono, #00d4ff

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (Logo + Stock Selector Dropdown)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┬───────────────────────────┐│
│  │                             │    AI INSIGHT PANEL       ││
│  │   CHART AREA                │   - Next Day Forecast      ││
│  │   (Lightweight Charts)      │   - Confidence Score      ││
│  │                             │   - Key Drivers           ││
│  │                             ├───────────────────────────┤│
│  │                             │   PORTFOLIO SIMULATOR     ││
│  │                             │   - Starting: $10,000    ││
│  │                             │   - Current Value         ││
│  │                             │   - vs Buy & Hold         ││
│  └─────────────────────────────┴───────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  FOOTER (Data attribution + Links)                         │
└─────────────────────────���───────────────────────────────────┘
```

### Responsive Breakpoints
- **Desktop:** ≥1024px (2-column layout)
- **Tablet:** 768px-1023px (stacked layout)
- **Mobile:** <768px (single column, scrollable)

---

## 4. Component Specifications

### 4.1 Header Component
- **Logo:** "NEXUS" text with cyan accent, "TRADE AI" in white
- **Stock Selector:** Dropdown with search, dark background
- **Available Stocks:**
  - AAPL (Apple)
  - MSFT (Microsoft)
  - NVDA (NVIDIA)
  - GOOGL (Alphabet)
  - AMZN (Amazon)
  - TSLA (Tesla)
  - META (Meta Platforms)
  - ^KSE (KSE 100 Index - Pakistan)

### 4.2 Chart Component
- **Library:** Lightweight Charts v4.x
- **Chart Type:** Candlestick with volume
- **Features:**
  - Auto-scaling axes
  - Crosshair cursor
  - Time range selector (1D, 1W, 1M, 3M, 1Y)
  - Real-time price line
- **Colors:**
  - Candle Up: #00ff88
  - Candle Down: #ff4757
  - Volume: rgba(0, 212, 255, 0.3)
  - Grid: #1f2937
  - Crosshair: #00d4ff

### 4.3 AI Insight Panel
- **Prediction Display:**
  - Large arrow icon (↑ cyan for UP, ↓ red for DOWN)
  - Probability badge (e.g., "78% Probability of Upward Trend")
- **Confidence Gauge:**
  - Visual meter (Low/Medium/High)
  - Color-coded (red→yellow→green gradient)
- **Key Drivers:**
  - RSI (Relative Strength Index)
  - MA20 (20-day Moving Average)
  - MA50 (50-day Moving Average)
  - Volatility indicator
  - Each with up/down indicator

### 4.4 Portfolio Simulator
- **Starting Balance:** $10,000
- **Display:**
  - AI Strategy Return (green/red)
  - Buy & Hold Return (green/red)
  - Performance difference
- **Simulation Logic:**
  - Buy stock when AI predicts UP
  - Hold when AI predicts DOWN
  - Compare to holding since start

---

## 5. API Specification

### Backend Endpoints

#### GET /api/stocks
Returns list of available stocks
```json
{
  "stocks": [
    {"symbol": "AAPL", "name": "Apple Inc."},
    {"symbol": "MSFT", "name": "Microsoft Corporation"}
  ]
}
```

#### GET /api/stock/{ticker}
Returns OHLCV data for a ticker
```json
{
  "symbol": "NVDA",
  "data": [
    {
      "time": "2024-01-01",
      "open": 450.00,
      "high": 455.00,
      "low": 448.00,
      "close": 452.50,
      "volume": 45000000
    }
  ]
}
```

#### GET /api/predict/{ticker}
Returns AI prediction (mocked/SMA-based)
```json
{
  "symbol": "NVDA",
  "prediction": "UP",
  "probability": 78,
  "confidence": "HIGH",
  "drivers": {
    "rsi": "OVERSOLD",
    "ma20": "ABOVE_PRICE",
    "ma50": "BELOW_PRICE",
    "volatility": "LOW"
  },
  "timestamp": "2024-01-15T16:00:00Z"
}
```

---

## 6. Data Processing Pipeline

### 6.1 Stock Data Fetching
1. Frontend requests stock data from backend
2. Backend uses yfinance to fetch historical data
3. Backend transforms data to Lightweight Charts format
4. Return JSON to frontend

### 6.2 Prediction Algorithm (Mocked/SMA)
1. Fetch last 30 days of closing prices
2. Calculate:
   - Simple Moving Average (20-day)
   - Simple Moving Average (50-day)
   - RSI (14-day period)
   - Volatility (standard deviation)
3. Decision logic:
   ```
   IF MA20 > MA50 AND RSI < 70 → UP (high confidence)
   ELSE IF MA20 < MA50 AND RSI > 30 → DOWN (high confidence)
   ELSE IF price > MA20 → UP (medium confidence)
   ELSE → DOWN (low confidence)
   ```

### 6.3 Portfolio Simulation
1. Track daily positions
2. On each day:
   - If AI predicts UP: invest available capital
   - If AI predicts DOWN: sell all holdings
3. Calculate total return vs buy-and-hold benchmark

---

## 7. File Structure

```
/nexus-trade-ai/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── services/
│   │   ├── stock_service.py # Stock data fetching
│   │   └── predict_service.py # Prediction logic
│   └── models/
│       └── schemas.py       # Pydantic models
├── frontend/
│   ├── app/
│   │   ├── layout.tsx      # Next.js layout
│   │   ├── page.tsx        # Main dashboard
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── Header.tsx      # Header component
│   │   ├── StockChart.tsx  # Chart component
│   │   ├── AIInsight.tsx   # AI panel
│   │   └── Portfolio.tsx  # Portfolio simulator
│   ├── lib/
│   │   ├── api.ts          # API client
│   │   └── utils.ts        # Utility functions
│   ├── package.json        # Node dependencies
│   ├── tailwind.config.js # Tailwind config
│   └── tsconfig.json      # TypeScript config
├── SPEC.md                  # This file
└── README.md              # Setup instructions
```

---

## 8. Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme with cyan/green accents renders correctly
- [ ] Chart displays candlestick data with volume
- [ ] Stock dropdown shows all 8 stocks
- [ ] AI Insight panel shows prediction with probability
- [ ] Confidence gauge displays visually
- [ ] Key drivers show with indicators
- [ ] Portfolio shows simulated returns

### Functional Requirements
- [ ] Stock selector changes chart Data
- [ ] Chart updates without page refresh
- [ ] Prediction loads with stock data
- [ ] All API endpoints return valid JSON
- [ ] Responsive layout works on tablet/mobile

### Performance
- [ ] Initial page load < 3 seconds
- [ ] Chart renders < 1 second
- [ ] Prediction calculation < 500ms