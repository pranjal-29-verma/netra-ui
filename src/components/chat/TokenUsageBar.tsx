import React, { useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTokenStore } from '../../store/tokenStore';

export const TokenUsageBar: React.FC = () => {
  const { usage, fetchUsage } = useTokenStore();
  const warned = useRef(false);

  useEffect(() => {
    fetchUsage().catch(() => {});
  }, [fetchUsage]);

  useEffect(() => {
    if (!usage) return;
    if (usage.usage_percentage >= 80 && !warned.current) {
      warned.current = true;
      toast('You have used 80% of your daily token quota.', { icon: '⚠️' });
    }
  }, [usage]);

  if (!usage) return null;

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
    <div className="px-4 py-3 border-t border-gray-200">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-600">Daily Tokens</span>
        </div>
        <span className={`text-xs font-medium ${textColor}`}>
          {isExhausted ? 'Quota reached' : `${pct.toFixed(0)}% used`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">
          {usage.tokens_used.toLocaleString()} used
        </span>
        <span className="text-xs text-gray-400">
          {usage.daily_quota.toLocaleString()} limit
        </span>
      </div>

      {isExhausted && (
        <p className="text-xs text-red-500 mt-1.5 font-medium">
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
