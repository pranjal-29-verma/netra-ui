import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, Check, FileText, Globe } from 'lucide-react';
import type { Message as MessageType } from '../../types';

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
              : 'bg-white text-gray-900 border border-gray-200 rounded-tl-sm'
          }`}>
            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
              {isUser ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
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

            {/* Copy Button */}
            {!isUser && !message.isStreaming && message.content && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                title="Copy message"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
              </button>
            )}
          </div>

          {/* Metadata */}
          <div className={`flex items-center mt-1 text-xs text-gray-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
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

          {/* Source Citations */}
          {!isUser && !message.isStreaming && message.sources && message.sources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {message.sources.map((src, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-full"
                  title={src.filename}
                >
                  {src.file_type === 'url'
                    ? <Globe className="w-3 h-3 flex-shrink-0" />
                    : <FileText className="w-3 h-3 flex-shrink-0" />
                  }
                  <span className="max-w-32 truncate">{src.filename}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
