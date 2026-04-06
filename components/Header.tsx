'use client';

import { StockInfo } from '@/lib/api';

interface HeaderProps {
  stocks: StockInfo[];
  selectedStock: string;
  onStockChange: (symbol: string) => void;
  loading: boolean;
}

export default function Header({ stocks, selectedStock, onStockChange, loading }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#374151] bg-[#111827]/80 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-[#00d4ff]">NEXUS</span>
          <span className="text-white">TRADE</span>
        </h1>
        <span className="px-2 py-0.5 text-xs font-semibold bg-[#00d4ff]/20 text-[#00d4ff] rounded">
          AI
        </span>
      </div>

      <div className="flex items-center gap-4">
        <select
          value={selectedStock}
          onChange={(e) => onStockChange(e.target.value)}
          disabled={loading}
          className="px-4 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00d4ff] transition-colors cursor-pointer disabled:opacity50 disabled:cursor-not-allowed"
        >
          {stocks.map((stock) => (
            <option key={stock.symbol} value={stock.symbol}>
              {stock.symbol} - {stock.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-sm text-[#94a3b8]">Live</span>
        </div>
      </div>
    </header>
  );
}