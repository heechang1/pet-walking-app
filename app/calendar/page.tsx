"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { getStampsByMonth } from "@/lib/api/stamps";
import { getWalksByDate } from "@/lib/api/walks";
import { Database } from "@/types/database.types";

type CalendarStamp = Database['public']['Tables']['calendar_stamp']['Row'];
type Walk = Database['public']['Tables']['walks']['Row'];

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stamps, setStamps] = useState<Record<string, CalendarStamp>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [walksForDate, setWalksForDate] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // If auth is done loading but no user, show empty calendar
    if (!user) {
      setStamps({});
      setLoading(false);
      return;
    }

    loadStamps();
  }, [user, authLoading, year, month]);

  const loadStamps = async () => {
    if (!user) {
      setStamps({});
      setLoading(false);
      return;
    }

    const selectedPetId = localStorage.getItem("selectedPetId");
    if (!selectedPetId) {
      setStamps({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const stampsData = await getStampsByMonth(selectedPetId, year, month);
      
      const stampsMap: Record<string, CalendarStamp> = {};
      stampsData.forEach((stamp) => {
        stampsMap[stamp.walk_date] = stamp;
      });
      
      setStamps(stampsMap);
    } catch (error) {
      console.error("Error loading stamps:", error);
      setStamps({});
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = async (dateStr: string) => {
    const selectedPetId = localStorage.getItem("selectedPetId");
    if (!selectedPetId) return;

    if (selectedDate === dateStr) {
      setSelectedDate(null);
      setWalksForDate([]);
      return;
    }

    setSelectedDate(dateStr);
    
    try {
      const walks = await getWalksByDate(selectedPetId, dateStr);
      setWalksForDate(walks);
    } catch (error) {
      console.error("Error loading walks for date:", error);
      setWalksForDate([]);
    }
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
    setSelectedDate(null);
    setWalksForDate([]);
  };

  const formatWalkTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days: (number | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FFFDF8] px-6 py-10">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md border border-[#A8DED0]/60 p-6">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => navigateMonth(-1)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                ← 이전
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {year}년 {monthNames[month - 1]}
              </h1>
              <button
                onClick={() => navigateMonth(1)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                다음 →
              </button>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐾</span>
                <span className="text-gray-600">산책함</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="text-gray-600">목표 달성 (20분 이상)</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-gray-700 py-2"
                >
                  {day}
                </div>
              ))}
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="aspect-square" />;
                }

                const dateStr = formatDate(
                  new Date(year, month - 1, day)
                );
                const stamp = stamps[dateStr];
                const isSelected = selectedDate === dateStr;
                const isToday = formatDate(new Date()) === dateStr;

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(dateStr)}
                    className={`
                      aspect-square rounded-lg border-2 transition
                      ${isToday ? "border-[#A8DED0] bg-[#A8DED0]/10" : "border-gray-200"}
                      ${isSelected ? "ring-2 ring-[#A8DED0] ring-offset-2" : ""}
                      ${stamp ? "hover:bg-[#FBD3D3]/20" : "hover:bg-gray-50"}
                      flex flex-col items-center justify-center
                    `}
                  >
                    <span
                      className={`text-lg font-semibold ${
                        isToday ? "text-[#A8DED0]" : "text-gray-900"
                      }`}
                    >
                      {day}
                    </span>
                    {stamp && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xl">🐾</span>
                        {stamp.stamp_count > 1 && (
                          <span className="text-xs text-gray-600">
                            {stamp.stamp_count}
                          </span>
                        )}
                        {stamp.goal_achieved && (
                          <span className="text-lg">⭐</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Walks */}
            {selectedDate && walksForDate.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {selectedDate} 산책 기록
                </h2>
                <div className="space-y-3">
                  {walksForDate.map((walk) => (
                    <div
                      key={walk.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatWalkTime(walk.start_time)} - {formatWalkTime(walk.end_time)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDuration(walk.duration_sec)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {walk.distance_m >= 1000
                              ? `${(walk.distance_m / 1000).toFixed(2)} km`
                              : `${Math.round(walk.distance_m)} m`}
                          </div>
                          {walk.steps && (
                            <div className="text-sm text-gray-600">
                              {walk.steps} 걸음
                            </div>
                          )}
                        </div>
                      </div>
                      {walk.duration_sec >= 1200 && (
                        <div className="mt-2 text-sm text-[#A8DED0] font-semibold">
                          ⭐ 목표 달성!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && walksForDate.length === 0 && !loading && (
              <div className="mt-6 pt-6 border-t border-gray-200 text-center text-gray-500">
                이 날짜의 산책 기록이 없습니다.
              </div>
            )}

            {/* Show loading indicator only when auth is loading or stamps are loading */}
            {authLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A8DED0] mx-auto mb-2"></div>
                <p className="text-gray-600">로딩 중...</p>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/start"
              className="inline-block bg-[#A8DED0] text-gray-900 font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-[#A8DED0]/90 transition"
            >
              시작 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
