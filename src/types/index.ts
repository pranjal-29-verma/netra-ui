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

// Chat types
export interface Message {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  tokensUsed?: number;
  sources?: any[];
  createdAt: string;
}

export interface Conversation {
  id: number;
  userId: number;
  title: string;
  isIncognito: boolean;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsStreaming: (streaming: boolean) => void;
}