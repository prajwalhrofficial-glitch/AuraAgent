"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
// import { insforge } from "@/lib/insforge"; // Removed for mock

interface AuthContextType {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setPhoneUser: (userData: PhoneUserData) => void;
  updateMockUser: (user: any) => void;
}

interface PhoneUserData {
  id: string;
  name?: string;
  phone: string;
  auth_provider: "phone";
  verification_method: "sms" | "whatsapp";
}

const PHONE_USER_KEY = "AuraAgent_phone_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define a mock guest admin user
const MOCK_USER = {
  id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  email: "guest@example.com",
  name: "Guest Admin",
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=GuestAdmin",
  auth_provider: "mock",
  profile: {
    name: "Guest Admin",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=GuestAdmin",
  },
  integrations: {
    whatsapp: {
      connected: true,
      isSimulated: true
    },
    gmail: {
      connected: true,
      isSimulated: true
    },
    slack: {
      connected: true,
      isSimulated: true
    },
    outlook: {
      connected: true,
      isSimulated: true
    },
    discord: {
      connected: true,
      isSimulated: true
    },
    linkedin: {
      connected: true,
      isSimulated: true
    },
    telegram: {
      connected: true,
      isSimulated: true
    }
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      // First check for a phone-authenticated user in localStorage
      const phoneUserRaw = typeof window !== "undefined" ? localStorage.getItem(PHONE_USER_KEY) : null;
      if (phoneUserRaw) {
        const phoneUser = JSON.parse(phoneUserRaw);
        setUser(phoneUser);
        setLoading(false);
        return;
      }

      // Check if we have a cached mock user in memory/localStorage (to simulate state changes)
      const cachedMockUser = typeof window !== "undefined" ? localStorage.getItem("mock_auth_user") : null;
      if (cachedMockUser) {
        setUser(JSON.parse(cachedMockUser));
      } else {
        // Automatically mock a logged-in user profile
        setUser(MOCK_USER);
        if (typeof window !== "undefined") {
          localStorage.setItem("mock_auth_user", JSON.stringify(MOCK_USER));
        }
      }
    } catch (err: any) {
      console.error("Unexpected error setting mock auth state:", err);
      setUser(MOCK_USER);
    } finally {
      setLoading(false);
    }
  };

  const setPhoneUser = (userData: PhoneUserData) => {
    const enriched = {
      ...userData,
      isPhoneAuth: true,
      profile: {
        name: userData.name || `User ${userData.phone.slice(-4)}`,
      },
      integrations: MOCK_USER.integrations, // attach mock integrations
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(PHONE_USER_KEY, JSON.stringify(enriched));
    }
    setUser(enriched);
  };

  // Helper to update the mock user state (e.g. for integrations)
  const updateMockUser = (updatedUser: any) => {
    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_auth_user", JSON.stringify(updatedUser));
    }
  };

  useEffect(() => {
    checkUser();

    // Add a global listener so API mocks can trigger auth state updates
    const handleStorageUpdate = () => {
      const cached = localStorage.getItem("mock_auth_user");
      if (cached) setUser(JSON.parse(cached));
    };
    window.addEventListener("mock_user_updated", handleStorageUpdate);
    return () => window.removeEventListener("mock_user_updated", handleStorageUpdate);
  }, []);

  const handleSignOut = async () => {
    try {
      // Clear all mock sessions
      if (typeof window !== "undefined") {
        localStorage.removeItem(PHONE_USER_KEY);
        localStorage.removeItem("mock_auth_user");
      }
    } catch (err) {
      console.error("Sign out threw exception:", err);
    } finally {
      // Reset back to mock user instead of null to prevent network loops/login screens
      setUser(MOCK_USER);
      if (typeof window !== "undefined") {
        localStorage.setItem("mock_auth_user", JSON.stringify(MOCK_USER));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut, refreshUser: checkUser, setPhoneUser, updateMockUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
