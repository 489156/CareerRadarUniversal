import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Radar Universal — 커리어 인텔리전스 워크스페이스",
  description: "전 직군 구직자·이직자를 위한 정량 매칭·실질 시급·근로계약 진단 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-[#0A0A0B] text-[#FAFAFA] antialiased selection:bg-zinc-200 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
