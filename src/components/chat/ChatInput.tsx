import React, { useState, useRef } from 'react';
import { Send, Paperclip, StopCircle } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onOpenDocuments?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  onStopStreaming?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onOpenDocuments,
  disabled = false,
  isStreaming = false,
  onStopStreaming,
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isStreaming) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Single unified container — border on wrapper, icons inside */}
        <div className="flex items-end border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
          <button
            type="button"
            onClick={onOpenDocuments}
            className="flex-shrink-0 p-3 text-gray-400 hover:text-gray-600 transition-colors"
            title="Manage documents"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            disabled={disabled}
            rows={1}
            autoFocus
            className="flex-1 py-3 bg-transparent outline-none resize-none disabled:text-gray-400 placeholder-gray-400 text-gray-900"
            style={{ minHeight: '48px', maxHeight: '200px' }}
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={onStopStreaming}
              className="flex-shrink-0 p-3 text-red-500 hover:text-red-600 transition-colors"
              title="Stop generating"
            >
              <StopCircle className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className="flex-shrink-0 p-3 text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </form>
  );
};