import React, { useState, useRef } from 'react';
import { X, Upload, Link, Trash2, FileText, Globe, AlertCircle, CheckCircle, Loader, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDocuments, useUploadFile, useAddUrl, useDeleteDocument } from '../../hooks/useDocuments';
import { useChatStore } from '../../store/chatStore';
import type { Document } from '../../types';

interface DocumentPanelProps {
  onClose: () => void;
}

const ACCEPTED = '.pdf,.txt,.docx,.md';
const MAX_MB = 20;

function StatusBadge({ status }: { status: Document['status'] }) {
  if (status === 'ready') return (
    <span className="flex items-center gap-1 text-xs text-green-600">
      <CheckCircle className="w-3 h-3" /> Ready
    </span>
  );
  if (status === 'processing') return (
    <span className="flex items-center gap-1 text-xs text-amber-600">
      <Loader className="w-3 h-3 animate-spin" /> Processing
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="w-3 h-3" /> Failed
    </span>
  );
}

function ScopeBadge({ scope }: { scope: Document['scope'] }) {
  if (scope === 'global') return (
    <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">Global</span>
  );
  return (
    <span className="text-xs px-1.5 py-0.5 bg-violet-50 text-violet-600 rounded font-medium">Conversation</span>
  );
}

function formatSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const DocumentPanel: React.FC<DocumentPanelProps> = ({ onClose }) => {
  const { currentConversation } = useChatStore();
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadScope, setUploadScope] = useState<'global' | 'conversation'>('global');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isIncognitoConversation = !!currentConversation && currentConversation.id < 0;
  const conversationId = currentConversation && currentConversation.id > 0 ? currentConversation.id : undefined;
  const thisChatscopeBlocked = uploadScope === 'conversation' && (isIncognitoConversation || !conversationId);
  const noConversationWarning = uploadScope === 'conversation' && !isIncognitoConversation && !conversationId;

  const { data: documents = [] } = useDocuments(conversationId);
  const uploadFile = useUploadFile(conversationId);
  const addUrl = useAddUrl(conversationId);
  const deleteDocument = useDeleteDocument(conversationId);

  const isUploading = uploadFile.isPending || addUrl.isPending;

  const isDuplicateFile = (filename: string) =>
    documents.some((d) => d.filename === filename && d.scope === uploadScope &&
      (uploadScope === 'global' || d.conversation_id === conversationId));

  const isDuplicateUrl = (url: string) =>
    documents.some((d) => d.source_url === url && d.scope === uploadScope &&
      (uploadScope === 'global' || d.conversation_id === conversationId));

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    if (thisChatscopeBlocked) return;
    const file = files[0];
    if (isDuplicateFile(file.name)) { toast.error(`"${file.name}" is already uploaded in this scope`); return; }
    if (file.size > MAX_MB * 1024 * 1024) { toast.error(`File exceeds ${MAX_MB} MB limit`); return; }
    uploadFile.mutate(
      { file, scope: uploadScope },
      {
        onSuccess: () => toast.success(`${file.name} uploaded`),
        onError: (err: any) => toast.error(err?.response?.data?.detail || err?.message || 'Upload failed'),
      },
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed || thisChatscopeBlocked) return;
    try { new URL(trimmed); } catch { toast.error('Please enter a valid URL'); return; }
    if (isDuplicateUrl(trimmed)) { toast.error('This URL is already added in this scope'); return; }
    addUrl.mutate(
      { url: trimmed, scope: uploadScope },
      {
        onSuccess: () => { setUrlInput(''); toast.success('URL added'); },
        onError: (err: any) => toast.error(err?.response?.data?.detail || err?.message || 'Failed to add URL'),
      },
    );
  };

  const handleDelete = (doc: Document) => {
    deleteDocument.mutate(doc.id, {
      onSuccess: () => toast.success(`${doc.filename} removed`),
      onError: () => toast.error('Failed to delete document'),
    });
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 w-80">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Documents</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Scope selector */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Upload Scope</p>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            <button
              onClick={() => setUploadScope('global')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors ${
                uploadScope === 'global' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Knowledge Base
            </button>
            <button
              onClick={() => setUploadScope('conversation')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors border-l border-gray-200 ${
                uploadScope === 'conversation' ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> This Chat
            </button>
          </div>
          {isIncognitoConversation && uploadScope === 'conversation' && (
            <p className="mt-1.5 text-xs text-purple-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              Not available in incognito — conversation is not saved
            </p>
          )}
          {noConversationWarning && (
            <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              Start a conversation first to upload here
            </p>
          )}
        </div>

        {/* Drag-and-drop upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !thisChatscopeBlocked && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            thisChatscopeBlocked
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              : isDragging
              ? 'border-primary-400 bg-primary-50 cursor-pointer'
              : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          <input ref={fileInputRef} type="file" accept={ACCEPTED} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          {isUploading
            ? <Loader className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
            : <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          }
          <p className="text-sm font-medium text-gray-700">{isUploading ? 'Uploading…' : 'Drop file or click to browse'}</p>
          <p className="text-xs text-gray-400 mt-1">PDF, TXT, DOCX, MD · Max {MAX_MB} MB</p>
        </div>

        {/* URL input */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Add URL</p>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
              placeholder="https://example.com/doc"
              disabled={thisChatscopeBlocked}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleAddUrl}
              disabled={!urlInput.trim() || isUploading || thisChatscopeBlocked}
              className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Link className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document list */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            {conversationId ? 'Documents for this chat' : 'Knowledge Base'} ({documents.length})
          </p>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No documents yet</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="group flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  {doc.file_type === 'url'
                    ? <Globe className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    : <FileText className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.filename}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <StatusBadge status={doc.status} />
                      <ScopeBadge scope={doc.scope} />
                      {doc.file_size && <span className="text-xs text-gray-400">{formatSize(doc.file_size)}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc)}
                    disabled={deleteDocument.isPending}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-opacity flex-shrink-0 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
