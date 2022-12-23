import { createContext, useEffect, useState, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";

export const ThemeContext = createContext<{
  theme: string | null;
  setTheme: Dispatch<SetStateAction<string | null>>;
}>({
  theme: "",
  setTheme: () => null,
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeState, setThemeState] = useState<string | null>("");

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setThemeState(theme || null);
  }, []);

  const value = { theme: themeState, setTheme: setThemeState };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
