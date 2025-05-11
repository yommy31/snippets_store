"use client";

import { ReactNode, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { ThemeProvider } from "next-themes";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const {
    fetchSnippets,
    fetchCategories,
    fetchTags,
    isLoading,
    error
  } = useAppStore();
  
  // Fetch initial data when the app loads
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch data in parallel
        await Promise.all([
          fetchSnippets(),
          fetchCategories(),
          fetchTags()
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    
    loadInitialData();
  }, [fetchSnippets, fetchCategories, fetchTags]);
  
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}