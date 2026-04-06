'use client';

import { PortfolioResult } from '@/lib/api';
import { formatPercent, formatNumber } from '@/lib/utils';

interface PortfolioProps {
  portfolio: PortfolioResult | null;
  loading: boolean;
}

function ReturnCard({
  label,
  value,
  isPrimary = false,
}: {
  label: string;
  value: number;
  isPrimary?: boolean;
}) {
  const isPositive = value >= 0;

  return (
    <div
      className={`p-3 rounded-lg ${
        isPrimary ? 'bg-[#0a0e17] border border-[#00d4ff]/30' : 'bg-[#0a0e17]'
      }`}
    >
      <p className="text-xs text-[#94a3b8] mb-1">{label}</p>
      <p
        className={`text-xl font-bold font-mono ${
          isPositive ? 'text-[#00ff88]' : 'text-[#ff4757]'
        }`}
      >
        {formatPercent(value)}
      </p>
    </div>
  );
}

export default function Portfolio({ portfolio, loading }: PortfolioProps) {
  const startBalance = 10000;

  if (loading) {
    return (
      <div className="p-4 bg-[#1f2937] rounded-lg border border-[#374151]">
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="p-4 bg-[#1f2937] rounded-lg border border-[#374151]">
        <p className="text-[#94a3b8] text-sm text-center">No portfolio data available</p>
      </div>
    );
  }

  const aiValue =
    startBalance + startBalance * (portfolio.ai_strategy_return / 100);
  const bhValue = startBalance + startBalance * (portfolio.buy_hold_return / 100);

  return (
    <div className="p-4 bg-[#1f2937] rounded-lg border border-[#374151]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-[#00ff88]/20 rounded-lg flex items-center justify-center">
          <span className="text-[#00ff88] font-bold text-sm">$</span>
        </div>
        <h3 className="text-lg font-semibold text-white">Portfolio Simulator</h3>
      </div>

      <div className="mb-4 p-3 bg-[#0a0e17] rounded-lg">
        <p className="text-xs text-[#94a3b8] mb-1">Starting Capital</p>
        <p className="text-xl font-bold text-white font-mono">
          ${formatNumber(startBalance)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <ReturnCard
          label="AI Strategy"
          value={portfolio.ai_strategy_return}
          isPrimary
        />
        <ReturnCard label="Buy & Hold" value={portfolio.buy_hold_return} />
      </div>

      <div
        className={`p-3 rounded-lg ${
          portfolio.difference >= 0
            ? 'bg-[#00ff88]/10 border border-[#00ff88]/30'
            : 'bg-[#ff4757]/10 border border-[#ff4757]/30'
        }`}
      >
        <p className="text-xs text-[#94a3b8] mb-1">Performance vs Buy & Hold</p>
        <p
          className={`text-lg font-bold font-mono ${
            portfolio.difference >= 0 ? 'text-[#00ff88]' : 'text-[#ff4757]'
          }`}
        >
          {portfolio.difference >= 0 ? '+' : ''}
          {formatPercent(portfolio.difference)}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-[#374151]">
        <div className="flex justify-between text-sm">
          <span className="text-[#94a3b8]">AI Portfolio Value</span>
          <span className="text-white font-mono font-medium">
            ${formatNumber(aiValue)}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-[#94a3b8]">Buy & Hold Value</span>
          <span className="text-white font-mono font-medium">
            ${formatNumber(bhValue)}
          </span>
        </div>
      </div>

      <p className="text-xs text-[#94a3b8] mt-3 italic">
        * Simulated: Buy when AI predicts UP, sell when DOWN
      </p>
    </div>
  );
}