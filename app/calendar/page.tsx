"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Button from "@/components/Button";
import Calendar from "@/components/Calendar";
import Stamp from "@/components/Stamp";
import { formatTimeLong } from "@/utils/time";
import { getTodayKey } from "@/utils/date";
import {
  aggregateWalkingRecordsByDate,
  type AggregatedWalkingRecord,
} from "@/utils/walkingData";
import { formatDistance } from "@/lib/location";

// MapView를 동적으로 import (SSR 방지)
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-lg h-[300px]">
      <p className="text-gray-600">지도를 불러오는 중...</p>
    </div>
  ),
});

interface StampData {
  date: string;
  hasStamp: boolean;
  timestamp: string;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [aggregatedRecords, setAggregatedRecords] = useState<
    Record<string, AggregatedWalkingRecord>
  >({});
  const [calendarStamps, setCalendarStamps] = useState<
    Record<string, StampData>
  >({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [stampedDate, setStampedDate] = useState<string | null>(null);

  useEffect(() => {
    // Load walking records
    const records = aggregateWalkingRecordsByDate();
    setAggregatedRecords(records);

    // Load stamp data
    const savedStamps = JSON.parse(
      localStorage.getItem("calendarStamps") || "{}"
    );
    setCalendarStamps(savedStamps);
  }, []);

  const handleDateClick = (dateKey: string) => {
    // If stamp already exists, just select
    if (calendarStamps[dateKey]?.hasStamp) {
      setSelectedDate(dateKey);
      return;
    }

    // Add stamp animation
    setStampedDate(dateKey);

    // Save stamp data
    const stampData: StampData = {
      date: dateKey,
      hasStamp: true,
      timestamp: new Date().toISOString(),
    };

    const existingStamps = { ...calendarStamps };
    existingStamps[dateKey] = stampData;
    setCalendarStamps(existingStamps);
    localStorage.setItem("calendarStamps", JSON.stringify(existingStamps));

    // Update record to include stamp
    if (aggregatedRecords[dateKey]) {
      const updatedRecords = { ...aggregatedRecords };
      updatedRecords[dateKey].hasStamp = true;
      setAggregatedRecords(updatedRecords);
    }

    setSelectedDate(dateKey);

    // Reset animation
    setTimeout(() => {
      setStampedDate(null);
    }, 600);
  };

  const getDateStatus = (dateKey: string) => {
    const record = aggregatedRecords[dateKey];
    const stamp = calendarStamps[dateKey];
    return {
      hasRecord: !!record,
      hasStamp: record?.hasStamp || stamp?.hasStamp || false,
      isSelected: selectedDate === dateKey,
    };
  };

  const selectedRecord = selectedDate
    ? aggregatedRecords[selectedDate]
    : null;

  const selectedPath = selectedRecord?.allPaths || [];
  const mapCenter: [number, number] | undefined =
    selectedPath.length > 0
      ? [selectedPath[0].latitude, selectedPath[0].longitude]
      : undefined;

  return (
    <div className="min-h-screen bg-[#FFFDF8] px-4 sm:px-6 py-8 sm:py-10">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            산책 달력
          </h1>
          <p className="text-gray-600 text-sm">
            날짜를 클릭하면 바로 도장이 찍혀요 <Stamp size="sm" />
          </p>
        </div>

        {/* Calendar Component */}
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          onDateClick={handleDateClick}
          getDateStatus={getDateStatus}
          selectedDate={selectedDate}
        />

        {/* Selected date info and map */}
        {selectedDate && selectedRecord && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4 animate-fadeIn">
              <h3 className="font-bold text-gray-900 text-lg">
                {selectedDate} 산책 기록
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">총 산책 시간</span>
                  <span className="font-semibold text-base">
                    {formatTimeLong(selectedRecord.totalDuration)}
                  </span>
                </div>
                {selectedRecord.totalDistance > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">총 이동 거리</span>
                    <span className="font-semibold text-base">
                      {formatDistance(selectedRecord.totalDistance)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">산책 횟수</span>
                  <span className="font-semibold text-base">
                    {selectedRecord.recordCount}회
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">좌표 개수</span>
                  <span className="font-semibold text-base">
                    {selectedRecord.coordinateCount}개
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">첫 시작</span>
                  <span className="font-semibold text-base">
                    {selectedRecord.firstStartTime}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">마지막 종료</span>
                  <span className="font-semibold text-base">
                    {selectedRecord.lastEndTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Map */}
            {selectedPath.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6 space-y-3 animate-fadeIn">
                <h3 className="font-bold text-gray-900 text-lg">산책 경로</h3>
                <div className="rounded-lg overflow-hidden">
                  <MapView
                    path={selectedPath}
                    center={mapCenter}
                    height="300px"
                    showPath={true}
                    showMarker={true}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stamp only (no record) */}
        {selectedDate &&
          !aggregatedRecords[selectedDate] &&
          calendarStamps[selectedDate]?.hasStamp && (
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4 animate-fadeIn">
              <h3 className="font-bold text-gray-900 text-lg">
                {selectedDate} 도장이 찍혔어요! <Stamp size="md" animated />
              </h3>
              <p className="text-sm text-gray-600">
                이 날은 산책 기록은 없지만 도장이 찍혔습니다.
              </p>
            </div>
          )}

        {/* Home button */}
        <Button href="/" variant="primary" size="md">
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
}
