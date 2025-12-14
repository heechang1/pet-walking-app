"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!loading) {
      // If Supabase is not configured, always go to /start
      if (!supabaseConfigured) {
        router.replace("/start");
      } else if (user) {
        router.replace("/start");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router, supabaseConfigured]);

  // Show loading state during redirect
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#FFFDF8]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A8DED0] mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </main>
  );
}



