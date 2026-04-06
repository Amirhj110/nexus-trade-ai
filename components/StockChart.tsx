'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, HistogramData } from 'lightweight-charts';
import { OHLC } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

interface StockChartProps {
  data: OHLC[];
  ticker: string;
  loading: boolean;
  period: string;
  onPeriodChange: (period: string) => void;
}

const periods = ['1M', '3M', '6M', '1Y'];

export default function StockChart({ data, ticker, loading, period, onPeriodChange }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [latestPrice, setLatestPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [percentChange, setPercentChange] = useState<number>(0);

  useEffect(() => {
    setSelectedPeriod(period);
  }, [period]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0a0e17' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#00d4ff',
          labelBackgroundColor: '#00d4ff',
        },
        horzLine: {
          color: '#00d4ff',
          labelBackgroundColor: '#00d4ff',
        },
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00ff88',
      downColor: '#ff4757',
      borderUpColor: '#00ff88',
      borderDownColor: '#ff4757',
      wickUpColor: '#00ff88',
      wickDownColor: '#ff4757',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#00d4ff',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const candleData: CandlestickData<Time>[] = data.map((d) => ({
      time: d.time as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const volumeData: HistogramData<Time>[] = data.map((d) => ({
      time: d.time as Time,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 71, 87, 0.3)',
    }));

    if (candleSeriesRef.current) {
      candleSeriesRef.current.setData(candleData);
    }
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(volumeData);
    }

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }

    const latest = data[data.length - 1];
    const prev = data[data.length - 2] || latest;
    setLatestPrice(latest.close);
    setPriceChange(latest.close - prev.close);
    setPercentChange(((latest.close - prev.close) / prev.close) * 100);
  }, [data]);

  const handlePeriodClick = (p: string) => {
    setSelectedPeriod(p);
    onPeriodChange(p);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] bg-[#0a0e17] rounded-lg border border-[#374151]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#94a3b8] text-sm">Loading chart...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0e17] rounded-lg border border-[#374151] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#374151]">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white font-mono">{ticker}</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#00d4ff] font-mono">
              ${formatNumber(latestPrice)}
            </span>
            <span className={`text-sm font-mono ${priceChange >= 0 ? 'text-[#00ff88]' : 'text-[#ff4757]'}`}>
              {priceChange >= 0 ? '+' : ''}{formatNumber(priceChange)} ({priceChange >= 0 ? '+' : ''}{formatNumber(percentChange)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodClick(p)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                selectedPeriod === p
                  ? 'bg-[#00d4ff] text-[#0a0e17]'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#1f2937]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div ref={chartContainerRef} className="flex-1 min-h-[400px]" />
    </div>
  );
}