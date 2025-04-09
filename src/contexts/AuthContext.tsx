
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { customToast } from "@/components/ui/custom-toast";
import { initializeGoogleSheet } from "@/services/googleSheetService";

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user session on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUser = localStorage.getItem('icon_bangladesh_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Try to initialize Google Sheet with the stored token
          initializeGoogleSheet(parsedUser.accessToken).catch(err => {
            console.error("Failed to initialize Google Sheet with stored token:", err);
          });
        }
      } catch (error) {
        console.error('Failed to restore auth session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Google OAuth implementation
  const loadGoogleScript = () => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return script;
  };

  useEffect(() => {
    const script = loadGoogleScript();
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const login = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: '546917825050-kd077hu7iqviik0521b16euged745v0m.apps.googleusercontent.com',
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
      });
      window.google.accounts.id.prompt();
    } else {
      customToast.error('Google Auth API not loaded yet. Please try again in a moment.');
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      setIsLoading(true);
      // Normally we would decode this token server-side to prevent tampering
      // For a frontend-only demo, we'll decode it client-side
      const token = response.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      const userObj: User = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        accessToken: token
      };
      
      setUser(userObj);
      localStorage.setItem('icon_bangladesh_user', JSON.stringify(userObj));
      
      // Initialize Google Sheet after login
      try {
        await initializeGoogleSheet(token);
      } catch (error) {
        console.error("Failed to initialize Google Sheet after login:", error);
        customToast.warning('গুগল শিট অ্যাক্সেস করতে সমস্যা হয়েছে। অনুগ্রহ করে লগআউট করে আবার লগইন করুন।');
      }
      
      customToast.success('সফলভাবে লগইন হয়েছে');
    } catch (error) {
      console.error('Login error:', error);
      customToast.error('লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('icon_bangladesh_user');
    customToast.success('সফলভাবে লগআউট হয়েছে');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
