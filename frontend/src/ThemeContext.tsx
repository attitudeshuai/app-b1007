import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import { settingsAPI } from './services/api';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Load theme setting from backend on startup
    const initTheme = async () => {
      try {
        const res = await settingsAPI.getAll();
        const themeSetting = res.data.find((s: any) => s.key === 'theme');
        if (themeSetting) {
          setIsDarkMode(themeSetting.value === 'dark');
        }
      } catch (e) {
        console.error("Failed to load theme settings", e);
      }
    };
    initTheme();
  }, []);

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await settingsAPI.update('theme', newMode ? 'dark' : 'light');
    } catch (e) {
      console.error("Failed to save theme setting", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#7c4dff',
            colorBgContainer: isDarkMode ? '#151521' : '#ffffff',
            colorBgLayout: isDarkMode ? '#0a0a14' : '#f0f2f5',
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
