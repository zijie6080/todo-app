// Base44 SDK integration
// This file wraps the Base44 JS SDK for auth + entities

declare global {
  interface Window {
    base44?: {
      auth: {
        login(email: string, password: string): Promise<{ token: string; user: Base44User }>;
        register(email: string, password: string, extra?: Record<string, string>): Promise<{ token: string; user: Base44User }>;
        logout(): void;
        getUser(): Base44User | null;
        getToken(): string | null;
        onAuthStateChange(cb: (user: Base44User | null) => void): () => void;
      };
      entities: {
        [name: string]: {
          list(params?: Record<string, unknown>): Promise<unknown[]>;
          get(id: string): Promise<unknown>;
          create(data: Record<string, unknown>): Promise<unknown>;
          update(id: string, data: Record<string, unknown>): Promise<unknown>;
          delete(id: string): Promise<void>;
          filter(params: Record<string, unknown>): Promise<unknown[]>;
        };
      };
    };
  }
}

export interface Base44User {
  id: string;
  email: string;
  full_name?: string;
}

export function getSDK() {
  if (!window.base44) throw new Error('Base44 SDK not loaded');
  return window.base44;
}
