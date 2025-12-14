"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    // Only enforce auth if Supabase is configured
    if (supabaseConfigured && !loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router, supabaseConfigured]);

  if (loading && supabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A8DED0] mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // If Supabase is not configured, allow access without auth
  if (supabaseConfigured && !user) {
    return null;
  }

  return <>{children}</>;
}

