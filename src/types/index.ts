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

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  tokens_used?: number;
  sources?: any[];
  created_at: string;
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
}