'use client';

import { Prediction } from '@/lib/api';

interface AIInsightProps {
  prediction: Prediction | null;
  loading: boolean;
}

function ConfidenceGauge({ level }: { level: string }) {
  const levels = {
    LOW: { width: '33%', color: '#ff4757' },
    MEDIUM: { width: '66%', color: '#ffd93d' },
    HIGH: { width: '100%', color: '#00ff88' },
  };
  const config = levels[level as keyof typeof levels] || levels.MEDIUM;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-[#94a3b8] mb-1">
        <span>LOW</span>
        <span>HIGH</span>
      </div>
      <div className="h-2 bg-[#1f2937] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: config.width, backgroundColor: config.color }}
        />
      </div>
    </div>
  );
}

function DriverIndicator({ label, value }: { label: string; value: string }) {
  const isPositive = value.includes('ABOVE') || value === 'OVERSOLD';
  const isNegative = value.includes('BELOW') || value === 'OVERBOUGHT';
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#374151] last:border-0">
      <span className="text-sm text-[#94a3b8]">{label}</span>
      <span
        className={`text-sm font-medium font-mono ${
          isPositive
            ? 'text-[#00ff88]'
            : isNegative
            ? 'text-[#ff4757]'
            : 'text-[#ffd93d]'
        }`}
      >
        {value === 'ABOVE_PRICE'
          ? '↑ Above'
          : value === 'BELOW_PRICE'
          ? '↓ Below'
          : value}
      </span>
    </div>
  );
}

export default function AIInsight({ prediction, loading }: AIInsightProps) {
  if (loading) {
    return (
      <div className="p-4 bg-[#1f2937] rounded-lg border border-[#374151]">
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="p-4 bg-[#1f2937] rounded-lg border border-[#374151]">
        <p className="text-[#94a3b8] text-sm text-center">No prediction data available</p>
      </div>
    );
  }

  const isUp = prediction.prediction === 'UP';

  return (
    <div className="p-4 bg-[#1f2937] rounded-lg border border-[#374151]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-[#00d4ff]/20 rounded-lg flex items-center justify-center">
          <span className="text-[#00d4ff] font-bold text-sm">AI</span>
        </div>
        <h3 className="text-lg font-semibold text-white">Nexus AI Insight</h3>
      </div>

      <div className="flex items-center justify-center gap-4 py-6 mb-4 bg-[#0a0e17] rounded-lg">
        <div
          className={`text-6xl ${
            isUp ? 'text-[#00ff88]' : 'text-[#ff4757]'
          }`}
        >
          {isUp ? '↑' : '↓'}
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-1">
            {isUp ? 'UPWARD' : 'DOWNWARD'}
          </p>
          <p className="text-sm text-[#94a3b8]">
            Next Day Forecast
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm text-[#94a3b8]">Probability</span>
          <span className="text-2xl font-bold text-[#00d4ff] font-mono">
            {prediction.probability}%
          </span>
        </div>
        <ConfidenceGauge level={prediction.confidence} />
        <p className="text-xs text-center text-[#94a3b8] mt-1">
          {prediction.confidence} Confidence
        </p>
      </div>

      <div className="border-t border-[#374151] pt-4">
        <h4 className="text-sm font-medium text-white mb-2">Key Drivers</h4>
        <DriverIndicator label="RSI (14)" value={prediction.drivers.rsi} />
        <DriverIndicator label="MA (20)" value={prediction.drivers.ma20} />
        <DriverIndicator label="MA (50)" value={prediction.drivers.ma50} />
        <DriverIndicator label="Volatility" value={prediction.drivers.volatility} />
      </div>
    </div>
  );
}