
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

interface SettingsContextType {
  language: string;
  setLanguage: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
  dateFormat: string;
  setDateFormat: (value: string) => void;
  timezone: string;
  setTimezone: (value: string) => void;
  notifications: {
    stockAlerts: boolean;
    emailNotifs: boolean;
    lotEntryNotifs: boolean;
    securityAlerts: boolean;
  };
  setNotificationSetting: (key: string, value: boolean) => void;
  autoBackup: boolean;
  setAutoBackup: (value: boolean) => void;
}

const defaultSettings = {
  language: 'bn',
  currency: 'BDT',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'Asia/Dhaka',
  notifications: {
    stockAlerts: true,
    emailNotifs: true,
    lotEntryNotifs: false,
    securityAlerts: true,
  },
  autoBackup: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage if available
    const storedSettings = localStorage.getItem('icon_bangladesh_settings');
    return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('icon_bangladesh_settings', JSON.stringify(settings));
  }, [settings]);

  const setLanguage = (value: string) => {
    setSettings(prev => ({ ...prev, language: value }));
    toast.success('ভাষা পরিবর্তন করা হয়েছে।');
    document.documentElement.lang = value;
  };

  const setCurrency = (value: string) => {
    setSettings(prev => ({ ...prev, currency: value }));
    toast.success('কারেন্সি পরিবর্তন করা হয়েছে।');
  };

  const setDateFormat = (value: string) => {
    setSettings(prev => ({ ...prev, dateFormat: value }));
    toast.success('তারিখ ফরম্যাট পরিবর্তন করা হয়েছে।');
  };

  const setTimezone = (value: string) => {
    setSettings(prev => ({ ...prev, timezone: value }));
    toast.success('টাইমজোন পরিবর্তন করা হয়েছে।');
  };

  const setNotificationSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
    toast.success(`${key} নোটিফিকেশন ${value ? 'চালু' : 'বন্ধ'} করা হয়েছে।`);
  };

  const setAutoBackup = (value: boolean) => {
    setSettings(prev => ({ ...prev, autoBackup: value }));
    toast.success(`অটো-ব্যাকআপ ${value ? 'চালু' : 'বন্ধ'} করা হয়েছে।`);
  };

  return (
    <SettingsContext.Provider
      value={{
        language: settings.language,
        setLanguage,
        currency: settings.currency,
        setCurrency,
        dateFormat: settings.dateFormat,
        setDateFormat,
        timezone: settings.timezone,
        setTimezone,
        notifications: settings.notifications,
        setNotificationSetting,
        autoBackup: settings.autoBackup,
        setAutoBackup,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
