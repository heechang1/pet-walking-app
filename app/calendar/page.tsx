"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  getAllWalkingRecords, 
  hasWalkingRecord, 
  hasGoalAchieved,
  getTotalMinutesForDate,
  formatDate 
} from "@/utils/walkingData";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [walkingRecords, setWalkingRecords] = useState<Record<string, boolean>>({});
  const [goalRecords, setGoalRecords] = useState<Record<string, boolean>>({});
  const [minutesByDate, setMinutesByDate] = useState<Record<string, number>>({});

  // Load walking records
  useEffect(() => {
    const loadRecords = () => {
      const records = getAllWalkingRecords();
      const recordsMap: Record<string, boolean> = {};
      const minutesMap: Record<string, number> = {};
      
      records.forEach((record) => {
        recordsMap[record.date] = true;
        minutesMap[record.date] = (minutesMap[record.date] || 0) + record.elapsedMinutes;
      });

      setWalkingRecords(recordsMap);
      setMinutesByDate(minutesMap);

      // Load goal records
      const goalData = localStorage.getItem("goalRecords");
      if (goalData) {
        try {
          setGoalRecords(JSON.parse(goalData));
        } catch (e) {
          console.error("Error parsing goal records:", e);
        }
      }
    };

    loadRecords();
    // Refresh every second to catch new records
    const interval = setInterval(loadRecords, 1000);
    return () => clearInterval(interval);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const calendarDays: (Date | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate longest streak of consecutive walking days
  const calculateLongestStreak = (): number => {
    const dates = Object.keys(walkingRecords).sort();
    if (dates.length === 0) return 0;

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  };

  const getDateKey = (date: Date | null): string | null => {
    if (!date) return null;
    return formatDate(date);
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] px-6 py-10">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/start"
            className="text-gray-600 hover:text-gray-900 transition"
          >
            ← 돌아가기
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">산책 캘린더</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-md border border-[#FBD3D3]/60 p-4">
          <button
            onClick={goToPreviousMonth}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            ←
          </button>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {year}년 {monthNames[month]}
            </div>
            <button
              onClick={goToToday}
              className="text-xs text-gray-500 hover:text-gray-700 mt-1"
            >
              오늘로 이동
            </button>
          </div>
          <button
            onClick={goToNextMonth}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-md border border-[#FBD3D3]/60 p-4">
          {/* Day names header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const dateKey = getDateKey(date);
              const hasRecord = dateKey ? walkingRecords[dateKey] || false : false;
              const hasGoal = dateKey ? goalRecords[dateKey] || false : false;
              const minutes = dateKey ? minutesByDate[dateKey] || 0 : 0;
              const today = isToday(date);

              return (
                <div
                  key={index}
                  className={`
                    aspect-square flex flex-col items-center justify-center
                    rounded-lg relative
                    ${date ? "hover:bg-gray-50 cursor-pointer" : ""}
                    ${today ? "ring-2 ring-[#A8DED0]" : ""}
                    ${hasRecord ? "bg-[#FBD3D3]/20" : ""}
                  `}
                >
                  {date && (
                    <>
                      <span
                        className={`text-sm ${
                          date.getMonth() !== month
                            ? "text-gray-300"
                            : today
                            ? "font-bold text-[#A8DED0]"
                            : "text-gray-700"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {hasRecord && (
                        <div className="flex flex-col items-center mt-1">
                          <span className="text-lg">🐾</span>
                          {hasGoal && (
                            <span className="text-xs text-[#A8DED0] font-semibold">⭐</span>
                          )}
                          {minutes > 0 && (
                            <span className="text-xs text-gray-500 mt-0.5">
                              {minutes}분
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl shadow-md border border-[#A8DED0]/60 p-4">
          <div className="text-sm font-semibold text-gray-900 mb-2">범례</div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-lg">🐾</span>
              <span>산책 기록이 있는 날</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8DED0] font-semibold">⭐</span>
              <span>목표 달성한 날 (20분 이상)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-[#A8DED0]"></div>
              <span>오늘</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl shadow-md border border-[#FBD3D3]/60 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Object.keys(walkingRecords).length}
              </div>
              <div className="text-xs text-gray-600">이번 달<br />산책한 날</div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-[#A8DED0]/60 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Object.keys(goalRecords).length}
              </div>
              <div className="text-xs text-gray-600">목표 달성</div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-[#F6C28B]/60 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {calculateLongestStreak()}
              </div>
              <div className="text-xs text-gray-600">최장 연속<br />날짜</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

