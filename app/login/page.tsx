"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabaseBrowserClient.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setMessage("로그인 링크가 이메일로 전송되었습니다! 이메일을 확인해주세요.");
    } catch (error: any) {
      console.error("Login error:", error);
      setMessage(error.message || "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-md border border-[#A8DED0]/60 p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">반려동물 산책 앱</h1>
            <p className="text-gray-600">이메일로 로그인하세요</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A8DED0] focus:border-transparent outline-none"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#A8DED0] text-gray-900 font-semibold py-3 rounded-lg shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "전송 중..." : "로그인 링크 보내기"}
            </button>
          </form>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.includes("오류") || message.includes("에러")
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            <p>이메일로 받은 링크를 클릭하면 로그인됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

