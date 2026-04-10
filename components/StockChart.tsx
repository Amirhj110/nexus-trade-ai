'use client';

import { useMemo, useState } from 'react';
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
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [hoverData, setHoverData] = useState<OHLC | null>(null);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  const latest = chartData[chartData.length - 1];
  const prev = chartData[chartData.length - 2] || latest;
  const latestPrice = latest?.close || 0;
  const priceChange = latest ? latest.close - prev.close : 0;
  const percentChange = prev ? ((latest.close - prev.close) / prev.close) * 100 : 0;

  // SVG Chart dimensions
  const width = 800;
  const height = 400;
  const padding = { top: 20, right: 60, bottom: 40, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (chartData.length === 0) return { minPrice: 0, maxPrice: 100, priceRange: 100 };
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    return { minPrice: min - range * 0.05, maxPrice: max + range * 0.05, priceRange: range * 1.1 };
  }, [chartData]);

  const maxVolume = useMemo(() => {
    if (chartData.length === 0) return 1;
    return Math.max(...chartData.map(d => d.volume));
  }, [chartData]);

  const priceToY = (price: number) => padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  const indexToX = (index: number) => padding.left + (index / (chartData.length - 1 || 1)) * chartWidth;

  const handlePeriodClick = (p: string) => {
    setSelectedPeriod(p);
    onPeriodChange(p);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - padding.left;
    const index = Math.round((x / chartWidth) * (chartData.length - 1));
    if (index >= 0 && index < chartData.length) {
      setHoverData(chartData[index]);
    }
  };

  const handleMouseLeave = () => {
    setHoverData(null);
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
              ${formatNumber(hoverData?.close || latestPrice)}
            </span>
            <span className={`text-sm font-mono ${priceChange >= 0 ? 'text-[#00ff88]' : 'text-[#ff4757]'}`}>
              {priceChange >= 0 ? '+' : ''}{formatNumber(priceChange)} ({priceChange >= 0 ? '+' : ''}{formatNumber(percentChange)}%)
            </span>
          </div>
          {hoverData && (
            <span className="text-xs text-[#94a3b8]">
              O: ${formatNumber(hoverData.open)} H: ${formatNumber(hoverData.high)} L: ${formatNumber(hoverData.low)} V: {formatNumber(hoverData.volume)}
            </span>
          )}
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

      <div className="flex-1 min-h-[400px] p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={padding.top + chartHeight * tick}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight * tick}
                stroke="#1f2937"
                strokeWidth={1}
              />
              <text
                x={padding.left + chartWidth + 5}
                y={padding.top + chartHeight * tick + 4}
                fill="#94a3b8"
                fontSize={10}
                fontFamily="monospace"
              >
                {formatNumber(maxPrice - priceRange * tick)}
              </text>
            </g>
          ))}

          {/* Volume bars (background) */}
          {chartData.map((d, i) => {
            const x = indexToX(i);
            const barWidth = chartWidth / chartData.length * 0.6;
            const volHeight = (d.volume / maxVolume) * chartHeight * 0.2;
            return (
              <rect
                key={`vol-${i}`}
                x={x - barWidth / 2}
                y={padding.top + chartHeight - volHeight}
                width={barWidth}
                height={volHeight}
                fill={d.close >= d.open ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 71, 87, 0.2)'}
              />
            );
          })}

          {/* Candlesticks */}
          {chartData.map((d, i) => {
            const x = indexToX(i);
            const candleWidth = Math.max(2, chartWidth / chartData.length * 0.5);
            const isUp = d.close >= d.open;
            const color = isUp ? '#00ff88' : '#ff4757';
            const bodyTop = priceToY(Math.max(d.open, d.close));
            const bodyBottom = priceToY(Math.min(d.open, d.close));
            const bodyHeight = Math.max(1, bodyBottom - bodyTop);
            const wickTop = priceToY(d.high);
            const wickBottom = priceToY(d.low);

            return (
              <g key={i}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={wickTop}
                  x2={x}
                  y2={wickBottom}
                  stroke={color}
                  strokeWidth={1}
                />
                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isUp ? color : color}
                  stroke={color}
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* Crosshair */}
          {hoverData && (
            <>
              <line
                x1={padding.left}
                y1={priceToY(hoverData.close)}
                x2={padding.left + chartWidth}
                y2={priceToY(hoverData.close)}
                stroke="#00d4ff"
                strokeWidth={1}
                strokeDasharray="4,4"
                opacity={0.5}
              />
            </>
          )}

          {/* Date labels (simplified) */}
          {[0, Math.floor(chartData.length / 2), chartData.length - 1].map((i) => {
            if (i >= chartData.length) return null;
            const d = chartData[i];
            return (
              <text
                key={i}
                x={indexToX(i)}
                y={height - 10}
                fill="#94a3b8"
                fontSize={9}
                fontFamily="monospace"
                textAnchor="middle"
              >
                {d.time.slice(5)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}