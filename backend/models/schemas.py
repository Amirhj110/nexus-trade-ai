from pydantic import BaseModel
from typing import List, Optional


class StockInfo(BaseModel):
    symbol: str
    name: str


class StockList(BaseModel):
    stocks: List[StockInfo]


class OHLCV(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class StockData(BaseModel):
    symbol: str
    data: List[OHLCV]


class KeyDrivers(BaseModel):
    rsi: str
    ma20: str
    ma50: str
    volatility: str


class Prediction(BaseModel):
    symbol: str
    prediction: str
    probability: int
    confidence: str
    drivers: KeyDrivers
    timestamp: str