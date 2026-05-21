import React from 'react';

const SkeletonItem: React.FC = () => (
  <div className="flex items-start p-3 rounded-lg">
    <div className="w-4 h-4 mt-0.5 mr-3 flex-shrink-0 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
    <div className="flex-1 min-w-0 space-y-2">
      <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="h-2.5 w-1/3 rounded bg-gray-100 dark:bg-gray-600 animate-pulse" />
    </div>
  </div>
);

export const ConversationSkeleton: React.FC = () => (
  <div className="space-y-1 px-2 py-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <SkeletonItem key={i} />
    ))}
  </div>
);
