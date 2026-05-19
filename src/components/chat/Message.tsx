import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, Check } from 'lucide-react';
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
        <div
          className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'} ${
            isUser ? 'order-2' : 'order-1'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? 'bg-primary-600' : 'bg-gray-700'
            }`}
          >
            {isUser ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'order-1' : 'order-2'}`}>
          <div
            className={`group relative px-4 py-3 rounded-2xl ${
              isUser
                ? 'bg-primary-600 text-white rounded-tr-sm'
                : 'bg-white text-gray-900 border border-gray-200 rounded-tl-sm'
            }`}
          >
            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
              {isUser ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              )}
            </div>

            {/* Copy Button */}
            {!isUser && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
          </div>

          {/* Metadata */}
          <div
            className={`flex items-center mt-1 text-xs text-gray-500 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <span>
              {new Date(message.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {message.tokensUsed && (
              <>
                <span className="mx-1">•</span>
                <span>{message.tokensUsed} tokens</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};