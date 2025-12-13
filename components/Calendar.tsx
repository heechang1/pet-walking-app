"use client";

import { useState } from "react";
import { getMonthInfo, formatDateKey, getMonthName, getDayNames, getTodayKey } from "@/utils/date";
import Stamp from "@/components/Stamp";

interface CalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onDateClick: (dateKey: string) => void;
  getDateStatus: (dateKey: string) => {
    hasRecord?: boolean;
    hasStamp?: boolean;
    isSelected?: boolean;
  };
  selectedDate?: string | null;
}

export default function Calendar({
  currentMonth,
  onMonthChange,
  onDateClick,
  getDateStatus,
  selectedDate,
}: CalendarProps) {
  const { daysInMonth, startingDayOfWeek, year, month } = getMonthInfo(currentMonth);
  const dayNames = getDayNames();
  const todayKey = getTodayKey();

  const prevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const formatDateKeyForDay = (day: number) => {
    return formatDateKey(year, month, day);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="text-gray-600 hover:text-gray-900 transition text-xl font-bold hover:scale-110 active:scale-95"
          aria-label="Previous month"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          {year}년 {getMonthName(month)}
        </h2>
        <button
          onClick={nextMonth}
          className="text-gray-600 hover:text-gray-900 transition text-xl font-bold hover:scale-110 active:scale-95"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      {/* Day headers */}
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

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells */}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Date cells */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dateKey = formatDateKeyForDay(day);
          const status = getDateStatus(dateKey);
          const isToday = dateKey === todayKey;
          const isSelected = selectedDate === dateKey;

              return (
                <button
                  key={day}
                  onClick={() => onDateClick(dateKey)}
                  className={`aspect-square rounded-lg border-2 transition-all duration-300 ${
                    isSelected
                      ? "border-[#A8DED0] bg-[#A8DED0]/20 scale-105 shadow-md"
                      : status.hasStamp
                      ? "border-[#FBD3D3] bg-[#FBD3D3]/30 hover:scale-105 hover:shadow-sm hover:border-[#FBD3D3]"
                      : status.hasRecord
                      ? "border-[#F6C28B]/50 bg-[#F6C28B]/20 hover:border-[#F6C28B] hover:scale-105 hover:shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:scale-105 hover:shadow-sm hover:bg-gray-50"
                  } ${isToday ? "ring-2 ring-[#A8DED0] ring-offset-2" : ""}`}
                >
                  <div className="flex flex-col items-center justify-center h-full relative">
                    <span
                      className={`text-sm font-semibold transition-colors ${
                        isToday ? "text-[#A8DED0]" : "text-gray-700"
                      }`}
                    >
                      {day}
                    </span>
                    {(status.hasRecord || status.hasStamp) && (
                      <span className="mt-0.5">
                        <Stamp size="sm" animated={false} />
                      </span>
                    )}
                  </div>
                </button>
              );
        })}
      </div>
    </div>
  );
}

