"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to /start
    router.replace("/start");
  }, [router]);

  // Show loading state during redirect
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#FFFDF8]">
      <div className="text-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </main>
  );
}



