"use client";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { MoonIcon, SunIcon, SettingsIcon, MenuIcon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { MobileSidebar } from "./mobile-sidebar";

export function TopMenuBar() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { toggleSidebar } = useAppStore();
  const { theme, setTheme } = useTheme();
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  
  // Close mobile sidebar
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };
  
  return (
    <>
      <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className="md:hidden"
            aria-label="Toggle sidebar"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Code Snippet Manager</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Settings"
          >
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />
    </>
  );
}