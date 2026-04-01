import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return (saved as Theme) || "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    // Phase 1: add glass morph class
    root.classList.add("theme-transition");

    // Phase 2: switch theme variables
    localStorage.setItem("theme", theme);
    root.classList.toggle("dark", theme === "dark");

    // Phase 3: remove glass after stagger completes
    const timeout = setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 600); // ⬅ longer so stagger is noticeable

    return () => clearTimeout(timeout);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      "useTheme must be used within ThemeProvider",
    );
  }
  return context;
}