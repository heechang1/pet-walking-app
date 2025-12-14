"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export default function Header() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const supabaseConfigured = isSupabaseConfigured();

  // Don't show header on login page
  if (pathname === "/login" || pathname === "/auth/callback") {
    return null;
  }

  const handleLogout = async () => {
    if (supabaseConfigured) {
      await signOut();
      router.push("/login");
    }
  };

  // If Supabase is configured, only show header when user is logged in
  if (supabaseConfigured && !user) {
    return null;
  }

  return (
    <header className="bg-white border-b border-[#A8DED0]/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/start" className="text-xl font-bold text-gray-900">
              🐾 산책 앱
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link
                href="/start"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/start"
                    ? "text-[#A8DED0] bg-[#A8DED0]/10"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                시작
              </Link>
              <Link
                href="/pets"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/pets"
                    ? "text-[#A8DED0] bg-[#A8DED0]/10"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                반려동물
              </Link>
              <Link
                href="/calendar"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/calendar"
                    ? "text-[#A8DED0] bg-[#A8DED0]/10"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                캘린더
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {supabaseConfigured && user && (
              <span className="text-sm text-gray-600">{user.email}</span>
            )}
            {supabaseConfigured && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                로그아웃
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


