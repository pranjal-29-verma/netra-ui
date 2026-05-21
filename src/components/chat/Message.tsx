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

  // Deduplicate sources by document_id — multiple chunks from same doc = one citation
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
      <div className={`flex max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'} ${isUser ? 'order-2' : 'order-1'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-primary-600' : 'bg-gray-700'}`}>
            {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'order-1' : 'order-2'}`}>
          <div className={`group relative px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-primary-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm'
          }`}>
            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
              {isUser ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <>
                  {message.isStreaming && !message.content ? (
                    // Waiting for first token — WhatsApp-style typing indicator
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
                </>
              )}
            </div>

            {/* Copy Button */}
            {!isUser && !message.isStreaming && message.content && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all"
                title="Copy message"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
              </button>
            )}
          </div>

          {/* Metadata */}
          <div className={`flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span>
              {new Date(message.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.tokens_used && (
              <>
                <span className="mx-1">•</span>
                <span>{message.tokens_used} tokens</span>
              </>
            )}
          </div>

          {/* Source Citations — deduplicated, URL shown on hover */}
          {!isUser && !message.isStreaming && uniqueSources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {uniqueSources.map((src) =>
                src.file_type === 'url' && src.source_url ? (
                  <a
                    key={src.document_id}
                    href={src.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-colors"
                    title={src.source_url}
                  >
                    <Globe className="w-3 h-3 flex-shrink-0" />
                    <span className="max-w-32 truncate">{src.filename}</span>
                  </a>
                ) : (
                  <span
                    key={src.document_id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-full"
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
