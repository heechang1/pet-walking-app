"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabaseClient";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        router.replace("/start");
        return;
      }

      // Check for errors in URL hash fragment (e.g., #error=access_denied)
      const hash = window.location.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const errorType = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");
        
        if (errorType) {
          console.error("Auth error from hash:", errorType, errorDescription);
          
          let errorMessage = "로그인에 실패했습니다.";
          if (errorType === "otp_expired") {
            errorMessage = "이메일 링크가 만료되었습니다. 새로운 링크를 요청해주세요.";
          } else if (errorDescription) {
            errorMessage = decodeURIComponent(errorDescription.replace(/\+/g, " "));
          }
          
          setError(errorMessage);
          setLoading(false);
          setTimeout(() => {
            router.replace(`/login?error=${encodeURIComponent(errorMessage)}`);
          }, 3000);
          return;
        }
      }

      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/start";

      if (!code) {
        // No code parameter - redirect to start
        router.replace("/start");
        return;
      }

      try {
        // Exchange code for session
        const { error: exchangeError } = await supabaseBrowserClient.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Error exchanging code for session:", exchangeError);
          
          let errorMessage = "로그인에 실패했습니다. 다시 시도해주세요.";
          if (exchangeError.message?.includes("expired")) {
            errorMessage = "이메일 링크가 만료되었습니다. 새로운 링크를 요청해주세요.";
          }
          
          setError(errorMessage);
          setTimeout(() => {
            router.replace(`/login?error=${encodeURIComponent(errorMessage)}`);
          }, 3000);
          return;
        }

        // Success - redirect to start page
        router.replace(next);
      } catch (err) {
        console.error("Error in auth callback:", err);
        setError("로그인 처리 중 오류가 발생했습니다.");
        setTimeout(() => {
          router.replace(`/login?error=${encodeURIComponent("로그인 처리 중 오류가 발생했습니다.")}`);
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-6 py-10">
      <div className="text-center space-y-4">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A8DED0] mx-auto mb-4"></div>
            <p className="text-gray-600">로그인 중...</p>
          </>
        ) : error ? (
          <>
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-gray-500 mt-2">잠시 후 로그인 페이지로 이동합니다...</p>
          </>
        ) : (
          <>
            <div className="text-green-500 text-xl mb-2">✓</div>
            <p className="text-gray-600">로그인 완료! 이동 중...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-6 py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A8DED0] mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}

