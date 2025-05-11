import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopMenuBar } from "@/components/layout/top-menu-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { SnippetList } from "@/components/layout/snippet-list";
import { SnippetDetail } from "@/components/layout/snippet-detail";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Code Snippet Manager",
  description: "A lightweight personal code snippet manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col`}
      >
        <Providers>
          <TopMenuBar />
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - hidden on mobile, shown on md screens and up */}
            <div className="hidden md:block h-full">
              <Sidebar />
            </div>
            
            {/* Snippet List - full width on mobile, fixed width on md screens and up */}
            <div className="w-full md:w-80 h-full">
              <SnippetList />
            </div>
            
            {/* Snippet Detail - hidden on mobile and tablet, shown on lg screens and up */}
            <div className="hidden lg:block flex-1 h-full">
              <SnippetDetail />
            </div>
          </div>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
