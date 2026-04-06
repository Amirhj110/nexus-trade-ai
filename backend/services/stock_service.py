from typing import List, Dict, Any
from datetime import datetime
import yfinance as yf
import pandas as pd
import numpy as np
from abc import ABC, abstractmethod


class DataProvider(ABC):
    @abstractmethod
    def get_stock_data(self, ticker: str, period: str) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    def get_name(self) -> str:
        pass


class YFinanceProvider(DataProvider):
    def get_name(self) -> str:
        return "Yahoo Finance"
    
    def get_stock_data(self, ticker: str, period: str = "1y") -> List[Dict[str, Any]]:
        stock = yf.Ticker(ticker)
        df = stock.history(period=period)
        
        if df.empty:
            return []
        
        ohlc_data = []
        for idx, row in df.iterrows():
            ohlc_data.append({
                "time": idx.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"])
            })
        
        return ohlc_data


class AlphaVantageProvider(DataProvider):
    def __init__(self, api_key: str = "demo"):
        self.api_key = api_key
    
    def get_name(self) -> str:
        return "Alpha Vantage"
    
    def get_stock_data(self, ticker: str, period: str = "1y") -> List[Dict[str, Any]]:
        return []


class MockProvider(DataProvider):
    def get_name(self) -> str:
        return "Mock Data"
    
    def get_stock_data(self, ticker: str, period: str = "1y") -> List[Dict[str, Any]]:
        import random
        import math
        
        days_map = {"1M": 30, "3M": 90, "6M": 180, "1Y": 365, "2Y": 730}
        days = days_map.get(period, 365)
        
        base_price = {
            "AAPL": 175.0, "MSFT": 380.0, "NVDA": 480.0, "GOOGL": 140.0,
            "AMZN": 175.0, "TSLA": 250.0, "META": 350.0, "^KSE": 45000.0
        }.get(ticker, 100.0)
        
        data = []
        current_price = base_price
        start_date = datetime.now()
        
        for i in range(days, 0, -1):
            date = start_date - pd.Timedelta(days=i)
            volatility = 0.02
            change = (np.random.randn() * volatility)
            current_price = current_price * (1 + change)
            
            high = current_price * (1 + abs(np.random.randn() * 0.01))
            low = current_price * (1 - abs(np.random.randn() * 0.01))
            open_price = low + (high - low) * np.random.random()
            
            data.append({
                "time": date.strftime("%Y-%m-%d"),
                "open": round(open_price, 2),
                "high": round(high, 2),
                "low": round(low, 2),
                "close": round(current_price, 2),
                "volume": int(np.random.randint(1000000, 50000000))
            })
        
        return data


PROVIDERS: Dict[str, DataProvider] = {
    "yfinance": YFinanceProvider(),
    "alphavantage": AlphaVantageProvider(),
    "mock": MockProvider(),
}

DEFAULT_PROVIDER = "yfinance"


def get_provider(name: str = DEFAULT_PROVIDER) -> DataProvider:
    return PROVIDERS.get(name, PROVIDERS[DEFAULT_PROVIDER])


STOCKS = [
    {"symbol": "AAPL", "name": "Apple Inc.", "provider": "yfinance"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "provider": "yfinance"},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "provider": "yfinance"},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "provider": "yfinance"},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "provider": "yfinance"},
    {"symbol": "TSLA", "name": "Tesla Inc.", "provider": "yfinance"},
    {"symbol": "META", "name": "Meta Platforms Inc.", "provider": "yfinance"},
    {"symbol": "^KSE", "name": "KSE 100 Index (Pakistan)", "provider": "yfinance"},
    {"symbol": "BTC-USD", "name": "Bitcoin USD", "provider": "yfinance"},
    {"symbol": "ETH-USD", "name": "Ethereum USD", "provider": "yfinance"},
    {"symbol": "EURUSD=X", "name": "EUR/USD", "provider": "yfinance"},
    {"symbol": "GC=F", "name": "Gold Futures", "provider": "yfinance"},
]


def get_available_stocks() -> List[Dict[str, Any]]:
    return STOCKS


def get_stock_data(ticker: str, period: str = "1y", provider: str = DEFAULT_PROVIDER) -> Dict[str, Any]:
    data_provider = get_provider(provider)
    data = data_provider.get_stock_data(ticker, period)
    return {"symbol": ticker, "provider": data_provider.get_name(), "data": data}


def get_latest_price(ticker: str, provider: str = DEFAULT_PROVIDER) -> Dict[str, Any]:
    data_provider = get_provider(provider)
    data = data_provider.get_stock_data(ticker, "5d")
    
    if not data:
        return {"symbol": ticker, "price": 0.0, "change": 0.0, "change_percent": 0.0}
    
    latest = data[-1]
    prev = data[-2] if len(data) > 1 else latest
    change = latest["close"] - prev["close"]
    change_percent = (change / prev["close"]) * 100
    
    return {
        "symbol": ticker,
        "price": latest["close"],
        "change": round(change, 2),
        "change_percent": round(change_percent, 2)
    }