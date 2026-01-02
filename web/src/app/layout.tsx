import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LMWiki - 大模型百科全书",
  description: "探索、比较和评价各种大语言模型。LMWiki 提供全面的模型百科、跑分对比和社区评价，帮助你找到最适合的 AI 模型。",
  keywords: ["LLM", "大模型", "AI", "人工智能", "ChatGPT", "Claude", "Llama", "模型对比"],
  authors: [{ name: "LMWiki Team" }],
  openGraph: {
    title: "LMWiki - 大模型百科全书",
    description: "探索、比较和评价各种大语言模型",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1 pt-16">
        {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
