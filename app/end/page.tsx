"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getTodayTotalMinutes } from "@/utils/walkingData";

const pet = {
  name: "콩이",
  image:
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=240&q=80",
};

function EndPageContent() {
  const searchParams = useSearchParams();
  const [minutes, setMinutes] = useState(0);
  const [goalAchieved, setGoalAchieved] = useState(false);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    // Try to get data from sessionStorage first (from walking page)
    const walkSummary = sessionStorage.getItem("walkSummary");
    if (walkSummary) {
      try {
        const data = JSON.parse(walkSummary);
        setMinutes(data.minutes || 0);
        setGoalAchieved(data.goalAchieved || false);
        setDistance(data.distance || 0);
        sessionStorage.removeItem("walkSummary"); // Clean up
        return;
      } catch (e) {
        console.error("Error parsing walk summary:", e);
      }
    }

    // Fallback: get from URL params or today's total
    const urlMinutes = searchParams.get("minutes");
    const urlGoalAchieved = searchParams.get("goalAchieved");
    const urlDistance = searchParams.get("distance");

    if (urlMinutes) {
      setMinutes(parseInt(urlMinutes, 10));
    } else {
      // Fallback: get from today's total
      setMinutes(getTodayTotalMinutes());
    }

    if (urlGoalAchieved === "true") {
      setGoalAchieved(true);
    }

    if (urlDistance) {
      setDistance(parseFloat(urlDistance));
    }
  }, [searchParams]);

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">오늘 산책 완료!</h1>

        {/* Goal Achievement Banner */}
        {goalAchieved && (
          <div className="bg-gradient-to-r from-[#A8DED0] to-[#FBD3D3] rounded-2xl p-4 shadow-md border-2 border-[#A8DED0]">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">🎉</span>
              <span className="text-xl font-bold text-gray-900">오늘 목표 달성!</span>
              <span className="text-3xl">🎉</span>
            </div>
            <p className="text-sm text-gray-700 mt-1">20분 목표를 달성했습니다!</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-[#A8DED0] shadow-sm">
            <Image
              src={pet.image}
              alt={pet.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <p className="text-lg font-semibold text-gray-800">{pet.name}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-[#FBD3D3]/60 p-5 text-left space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>총 산책시간</span>
            <span className="font-semibold text-gray-900">{minutes}분</span>
          </div>
          {distance > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>총 거리</span>
              <span className="font-semibold text-gray-900">{formatDistance(distance)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>일일 목표</span>
            <span className="font-semibold text-gray-900">
              {goalAchieved ? "✅ 달성" : `${minutes}/20분`}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/calendar"
            className="block w-full bg-[#A8DED0] text-gray-900 font-semibold py-4 rounded-full shadow-md transition active:scale-95"
          >
            캘린더 보기
          </Link>
          <Link
            href="/start"
            className="block w-full bg-[#FBD3D3] text-gray-900 font-semibold py-4 rounded-full shadow-md transition active:scale-95"
          >
            처음으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EndPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-6 py-10">
        <div className="text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <EndPageContent />
    </Suspense>
  );
}
