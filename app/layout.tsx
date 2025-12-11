import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "NFC Pet Walking",
  description: "Mint & pink pastel pet walking app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-[#FFFDF8] text-gray-900 antialiased">{children}</body>
    </html>
  );
}



