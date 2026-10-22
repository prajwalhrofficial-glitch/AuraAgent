export interface Chat {
  id: string;
  name?: string;
  unreadCount?: number;
}

export interface Message {
  key: {
    id: string;
    remoteJid: string;
    fromMe: boolean;
  };
  pushName?: string;
  message?: {
    conversation?: string;
    extendedTextMessage?: {
      text?: string;
    };
  };
  messageTimestamp: number;
}

export interface Contact {
  id: string;
  name?: string;
  phone?: string;
}

// Mock store that returns dummy data
export class WhatsAppStore {
  public chats: Chat[] = [
    { id: "dummy-chat-1", name: "Alice (Dummy)", unreadCount: 2 },
    { id: "dummy-chat-2", name: "Bob (Dummy)", unreadCount: 0 }
  ];
  public messages: Record<string, Message[]> = {
    "dummy-chat-1": [
      {
        key: { id: "msg-1", remoteJid: "dummy-chat-1", fromMe: false },
        pushName: "Alice",
        message: { conversation: "Hello! This is a simulated message." },
        messageTimestamp: Date.now() / 1000 - 3600
      },
      {
        key: { id: "msg-2", remoteJid: "dummy-chat-1", fromMe: true },
        pushName: "You",
        message: { conversation: "Hi Alice, testing the mock setup." },
        messageTimestamp: Date.now() / 1000 - 1800
      }
    ]
  };
  public contacts: Record<string, Contact> = {
    "dummy-chat-1": { id: "dummy-chat-1", name: "Alice", phone: "+15550100" },
    "dummy-chat-2": { id: "dummy-chat-2", name: "Bob", phone: "+15550200" }
  };

  constructor(userId: string, sessionDir: string) {
    // No-op for mock
  }

  public save() {
    // No-op for mock
  }

  public bind(ev: any) {
    // No-op for mock
  }
}

export interface WhatsAppSession {
  sock: any; // Mocked socket
  store: WhatsAppStore;
  status: "disconnected" | "connecting" | "connected";
  pairingCode?: string;
  phoneNumber?: string;
}

// Global mapping to survive Next.js hot-reloads
const globalForWhatsApp = global as unknown as {
  whatsappSessions?: Record<string, WhatsAppSession>;
};

if (!globalForWhatsApp.whatsappSessions) {
  globalForWhatsApp.whatsappSessions = {};
}

export const whatsappSessions = globalForWhatsApp.whatsappSessions;

export function getSessionDir(userId: string) {
  return `/mock/session/dir/${userId}`;
}

export function getWhatsAppSession(userId: string): WhatsAppSession | undefined {
  return whatsappSessions[userId];
}

export async function initWhatsAppConnection(
  userId: string,
  phoneNumber?: string,
  options?: { forceNew?: boolean }
): Promise<WhatsAppSession> {
  const store = new WhatsAppStore(userId, "");
  
  const session: WhatsAppSession = {
    sock: { logout: async () => {}, end: () => {} },
    store,
    status: "connected",
    phoneNumber: phoneNumber || "+15550199",
  };

  whatsappSessions[userId] = session;
  return session;
}

export async function disconnectWhatsApp(userId: string) {
  delete whatsappSessions[userId];
}
