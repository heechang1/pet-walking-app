"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ReplayMap from "@/components/ReplayMap";

interface WalkingData {
  path: [number, number][];
  duration: number;
  timestamp: number;
}

export default function ReplayPage() {
  const params = useParams();
  const walkId = params?.id as string;
  const [walkingData, setWalkingData] = useState<WalkingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walkId) {
      setError("산책 ID가 제공되지 않았습니다.");
      setLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(walkId);
      if (stored) {
        const data = JSON.parse(stored) as WalkingData;
        setWalkingData(data);
      } else {
        setError("산책 데이터를 찾을 수 없습니다.");
      }
    } catch (err) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
      console.error("Error loading walking data:", err);
    } finally {
      setLoading(false);
    }
  }, [walkId]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분 ${secs}초`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !walkingData) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">오류</h1>
          <p className="text-gray-600">{error || "데이터를 불러올 수 없습니다."}</p>
          <Link
            href="/"
            className="inline-block bg-[#A8DED0] text-gray-900 font-semibold px-6 py-3 rounded-full shadow-md transition active:scale-95"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] px-6 py-10">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">산책 재생</h1>
          <p className="text-sm text-gray-600">{formatDate(walkingData.timestamp)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-[#FBD3D3]/60 p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">총 산책시간</span>
            <span className="font-semibold text-gray-900">
              {formatTime(walkingData.duration)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">경로 지점 수</span>
            <span className="font-semibold text-gray-900">
              {walkingData.path.length}개
            </span>
          </div>
        </div>

        <div className="w-full">
          <ReplayMap path={walkingData.path} height="400px" />
        </div>

        <div className="flex space-x-3">
          <Link
            href="/"
            className="flex-1 text-center bg-gray-200 text-gray-900 font-semibold py-3 rounded-full shadow-sm transition active:scale-95"
          >
            홈으로
          </Link>
          <Link
            href="/walking"
            className="flex-1 text-center bg-[#A8DED0] text-gray-900 font-semibold py-3 rounded-full shadow-md transition active:scale-95"
          >
            새 산책 시작
          </Link>
        </div>
      </div>
    </div>
  );
}




