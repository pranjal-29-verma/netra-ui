import React, { useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTokenUsage } from '../../hooks/useTokenUsage';

export const TokenUsageBar: React.FC = () => {
  const { data: usage } = useTokenUsage();
  const warned = useRef(false);

  useEffect(() => {
    if (!usage) return;
    if (usage.usage_percentage >= 80 && !warned.current) {
      warned.current = true;
      toast('You have used 80% of your daily token quota.', { icon: '⚠️' });
    }
  }, [usage]);

  if (!usage) return (
    <div className="px-3 pt-2 pb-1">
      <div className="flex items-center justify-between mb-1">
        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 animate-pulse" />
    </div>
  );

  const pct = Math.min(usage.usage_percentage, 100);
  const isWarning = pct >= 80 && pct < 100;
  const isExhausted = pct >= 100;

  const barColor = isExhausted
    ? 'bg-red-500'
    : isWarning
    ? 'bg-amber-400'
    : 'bg-primary-500';

  const textColor = isExhausted
    ? 'text-red-600'
    : isWarning
    ? 'text-amber-600'
    : 'text-gray-500';

  return (
    <div className="px-3 pt-2 pb-1">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Daily Tokens</span>
        </div>
        <span className={`text-xs font-medium ${textColor}`}>
          {isExhausted ? 'Quota reached' : `${usage.tokens_used.toLocaleString()} / ${usage.daily_quota.toLocaleString()}`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isExhausted && (
        <p className="text-xs text-red-500 mt-1 font-medium">
          {(() => {
            const nextMidnightUTC = new Date();
            nextMidnightUTC.setUTCHours(24, 0, 0, 0);
            const resetTime = nextMidnightUTC.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Kolkata',
            });
            return `bruh you cooked all the tokens 💀 come back at ${resetTime} IST no cap`;
          })()}
        </p>
      )}
    </div>
  );
};
