import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Radar Universal — 차세대 커리어 인텔리전스",
  description: "모든 직군 구직자·이직자를 위한 개인 맞춤형 Universal Career Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#080b11] text-[#f1f5f9]">{children}</body>
    </html>
  );
}
