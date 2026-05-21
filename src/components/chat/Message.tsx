import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, Check, FileText, Globe } from 'lucide-react';
import type { Message as MessageType, MessageSource } from '../../types';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === 'user';

  const uniqueSources: MessageSource[] = message.sources
    ? Object.values(
        message.sources.reduce<Record<number, MessageSource>>((acc, src) => {
          if (!acc[src.document_id]) acc[src.document_id] = src;
          return acc;
        }, {}),
      )
    : [];

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex gap-3 max-w-3xl w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? 'bg-primary-600'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}>
            {isUser
              ? <User className="w-4 h-4 text-white" />
              : <Bot className="w-4 h-4 text-gray-700 dark:text-gray-200" />
            }
          </div>
        </div>

        {/* Bubble + metadata */}
        <div className={`flex flex-col min-w-0 flex-1 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`group relative px-4 py-3 rounded-2xl max-w-full ${
            isUser
              ? 'bg-primary-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm'
          }`}>

            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap m-0">{message.content}</p>
            ) : (
              <div className={`prose prose-sm max-w-none
                prose-p:my-1 prose-p:leading-relaxed
                prose-headings:mt-3 prose-headings:mb-1
                prose-ul:my-1 prose-ol:my-1
                prose-li:my-0.5
                prose-code:text-xs
                prose-pre:my-2
                dark:prose-invert`}>
                {message.isStreaming && !message.content ? (
                  <span className="flex items-center gap-1 py-1">
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                ) : (
                  <>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content || ' '}
                    </ReactMarkdown>
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-gray-500 animate-pulse ml-0.5 rounded-sm align-middle" />
                    )}
                  </>
                )}
              </div>
            )}

            {/* Copy button — AI only */}
            {!isUser && !message.isStreaming && message.content && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all"
                title="Copy message"
              >
                {copied
                  ? <Check className="w-3.5 h-3.5 text-green-600" />
                  : <Copy className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                }
              </button>
            )}
          </div>

          {/* Timestamp + tokens */}
          <div className="flex items-center mt-1 gap-1 text-xs text-gray-400 dark:text-gray-500">
            <span>
              {new Date(message.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.tokens_used && (
              <>
                <span>•</span>
                <span>{message.tokens_used} tokens</span>
              </>
            )}
          </div>

          {/* Source citations */}
          {!isUser && !message.isStreaming && uniqueSources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {uniqueSources.map((src) =>
                src.file_type === 'url' && src.source_url ? (
                  <a
                    key={src.document_id}
                    href={src.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    title={src.source_url}
                  >
                    <Globe className="w-3 h-3 flex-shrink-0" />
                    <span className="max-w-32 truncate">{src.filename}</span>
                  </a>
                ) : (
                  <span
                    key={src.document_id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                    title={src.filename}
                  >
                    <FileText className="w-3 h-3 flex-shrink-0" />
                    <span className="max-w-32 truncate">{src.filename}</span>
                  </span>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
