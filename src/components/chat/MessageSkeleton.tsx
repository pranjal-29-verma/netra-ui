import React from 'react';

const SkeletonBubble: React.FC<{ isUser?: boolean }> = ({ isUser = false }) => (
  <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
    {/* Avatar skeleton */}
    <div className="flex-shrink-0 mt-0.5">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    </div>

    {/* Bubble skeleton */}
    <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`rounded-2xl px-4 py-3 space-y-2 ${
        isUser
          ? 'bg-primary-200 dark:bg-primary-900/40 rounded-tr-sm'
          : 'bg-gray-200 dark:bg-gray-700 rounded-tl-sm'
      }`}>
        <div className="h-3 w-48 rounded bg-gray-300 dark:bg-gray-600 animate-pulse" />
        <div className="h-3 w-32 rounded bg-gray-300 dark:bg-gray-600 animate-pulse" />
      </div>
      <div className="h-2 w-12 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
    </div>
  </div>
);

export const MessageSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-6">
    <SkeletonBubble isUser />
    <SkeletonBubble />
    <SkeletonBubble isUser />
    <SkeletonBubble />
  </div>
);
