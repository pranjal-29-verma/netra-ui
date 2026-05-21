export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  googleId?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Document types
export interface Document {
  id: number;
  user_id: number;
  filename: string;
  file_type: string;
  file_size?: number;
  source_url?: string;
  status: 'ready' | 'processing' | 'failed';
  scope: 'global' | 'conversation';
  conversation_id?: number;
  created_at: string;
}

export interface DocumentState {
  documents: Document[];
  isUploading: boolean;
  fetchDocuments: (conversationId?: number) => Promise<void>;
  uploadFile: (file: File, scope?: 'global' | 'conversation', conversationId?: number) => Promise<void>;
  addUrl: (url: string, filename?: string, scope?: 'global' | 'conversation', conversationId?: number) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
}

// Token types
export interface TokenUsage {
  tokens_used: number;
  daily_quota: number;
  remaining: number;
  usage_percentage: number;
  total_tokens_used: number;
}

export interface TokenState {
  usage: TokenUsage | null;
  fetchUsage: () => Promise<void>;
}

// Chat types
export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  is_incognito: boolean;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface MessageSource {
  document_id: number;
  filename: string;
  file_type: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  tokens_used?: number;
  sources?: MessageSource[];
  created_at: string;
  isStreaming?: boolean; // local-only flag, not persisted
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  isIncognito: boolean;
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
  toggleIncognito: () => void;
  fetchConversations: () => Promise<void>;
  createConversation: () => Promise<Conversation>;
  deleteConversation: (id: number) => Promise<void>;
  fetchMessages: (conversationId: number) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => Promise<void>;
  stopStreaming: () => void;
}