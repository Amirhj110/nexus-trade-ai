from typing import Dict, Any
from datetime import datetime
import numpy as np
from .stock_service import get_stock_data


def calculate_rsi(prices: list, period: int = 14) -> float:
    if len(prices) < period + 1:
        return 50.0
    
    deltas = np.diff(prices)
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    
    avg_gain = float(np.mean(gains[-period:]))
    avg_loss = float(np.mean(losses[-period:]))
    
    if avg_loss == 0:
        return 100.0
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return float(rsi)


def calculate_ma(prices: list, period: int) -> float:
    if len(prices) < period:
        return prices[-1] if prices else 0
    return float(np.mean(prices[-period:]))


def calculate_volatility(prices: list) -> float:
    if len(prices) < 2:
        return 0.0
    returns = np.diff(prices) / prices[:-1]
    return float(np.std(returns) * 100)


def predict_trend(ticker: str) -> Dict[str, Any]:
    result = get_stock_data(ticker, "60d")
    data = result.get("data", [])
    
    if not data or len(data) < 30:
        return {
            "symbol": ticker,
            "prediction": "UP",
            "probability": 50,
            "confidence": "MEDIUM",
            "drivers": {
                "rsi": "NEUTRAL",
                "ma20": "NEUTRAL",
                "ma50": "NEUTRAL",
                "volatility": "MEDIUM"
            },
            "timestamp": datetime.now().isoformat()
        }
    
    closes = [d["close"] for d in data]
    latest_price = closes[-1]
    
    ma20 = calculate_ma(closes, 20)
    ma50 = calculate_ma(closes, 50)
    rsi = calculate_rsi(closes)
    volatility = calculate_volatility(closes)
    
    prediction = "UP"
    probability = 50
    confidence = "MEDIUM"
    
    if ma20 > ma50 and rsi < 70:
        prediction = "UP"
        probability = min(85, 60 + (70 - rsi) / 2)
        confidence = "HIGH"
    elif ma20 < ma50 and rsi > 30:
        prediction = "DOWN"
        probability = min(85, 60 + (rsi - 30) / 2)
        confidence = "HIGH"
    elif latest_price > ma20:
        prediction = "UP"
        probability = 65
        confidence = "MEDIUM"
    else:
        prediction = "DOWN"
        probability = 65
        confidence = "MEDIUM"
    
    rsi_status = "OVERSOLD" if rsi < 30 else "OVERBOUGHT" if rsi > 70 else "NEUTRAL"
    ma20_status = "ABOVE_PRICE" if ma20 > latest_price else "BELOW_PRICE"
    ma50_status = "ABOVE_PRICE" if ma50 > latest_price else "BELOW_PRICE"
    volatility_status = "LOW" if volatility < 2 else "HIGH" if volatility > 4 else "MEDIUM"
    
    return {
        "symbol": ticker,
        "prediction": prediction,
        "probability": int(probability),
        "confidence": confidence,
        "drivers": {
            "rsi": rsi_status,
            "ma20": ma20_status,
            "ma50": ma50_status,
            "volatility": volatility_status
        },
        "timestamp": datetime.now().isoformat()
    }


def simulate_portfolio(ticker: str, start_balance: float = 10000.0) -> Dict[str, Any]:
    result = get_stock_data(ticker, "1y")
    data = result.get("data", [])
    
    if not data or len(data) < 30:
        return {
            "ticker": ticker,
            "ai_strategy_return": 0.0,
            "buy_hold_return": 0.0,
            "difference": 0.0
        }
    
    closes = [d["close"] for d in data]
    initial_price = closes[0]
    
    shares = start_balance / initial_price
    buy_hold_value = shares * closes[-1]
    buy_hold_return = ((buy_hold_value - start_balance) / start_balance) * 100
    
    ai_balance = start_balance
    current_shares = 0
    in_position = False
    
    for i in range(30, len(closes)):
        subset_closes = closes[:i]
        
        ma20 = calculate_ma(subset_closes, 20)
        ma50 = calculate_ma(subset_closes, 50)
        
        if ma20 > ma50 and not in_position:
            current_shares = ai_balance / closes[i - 1]
            in_position = True
            ai_balance = 0
        elif ma20 < ma50 and in_position:
            ai_balance = current_shares * closes[i - 1]
            current_shares = 0
            in_position = False
    
    final_ai_balance = current_shares * closes[-1] if in_position else ai_balance
    ai_return = ((final_ai_balance - start_balance) / start_balance) * 100
    
    return {
        "ticker": ticker,
        "ai_strategy_return": round(float(ai_return), 2),
        "buy_hold_return": round(float(buy_hold_return), 2),
        "difference": round(float(ai_return - buy_hold_return), 2)
    }