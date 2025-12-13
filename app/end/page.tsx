"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileCard from "@/components/ProfileCard";
import SummaryCard from "@/components/SummaryCard";
import Button from "@/components/Button";
import { formatTimeLong } from "@/utils/time";

const pet = {
  name: "콩이",
  image:
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=240&q=80",
};

export default function EndPage() {
  const router = useRouter();
  const [summary, setSummary] = useState({
    total: "0분",
    start: "00:00",
    end: "00:00",
    elapsedSeconds: 0,
  });

  useEffect(() => {
    // localStorage에서 산책 데이터 가져오기
    const startTime = localStorage.getItem("walkingStartTime");
    const endTime = localStorage.getItem("walkingEndTime");
    const elapsed = localStorage.getItem("walkingElapsed");

    if (startTime && elapsed) {
      const elapsedSeconds = parseInt(elapsed, 10);
      const start = new Date(startTime);
      const end = endTime ? new Date(endTime) : new Date();

      const startTimeStr = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
      const endTimeStr = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;

      setSummary({
        total: formatTimeLong(elapsedSeconds),
        start: startTimeStr,
        end: endTimeStr,
        elapsedSeconds,
      });
    }
  }, []);

  const handleSave = () => {
    // 산책 기록을 localStorage에 저장
    const walkRecord = {
      date: new Date().toISOString().split("T")[0],
      startTime: summary.start,
      endTime: summary.end,
      duration: summary.elapsedSeconds,
      petName: pet.name,
    };

    // Note: This page is rarely used now as walking page navigates directly to calendar
    // But keeping for backward compatibility
    const existingRecords = JSON.parse(
      localStorage.getItem("walkingHistory") || "[]"
    );
    existingRecords.push(walkRecord);
    localStorage.setItem("walkingHistory", JSON.stringify(existingRecords));

    // 산책 상태 초기화
    localStorage.removeItem("walkingStartTime");
    localStorage.removeItem("walkingEndTime");
    localStorage.removeItem("walkingElapsed");
    localStorage.removeItem("walkingIsActive");

    // 달력 페이지로 이동
    router.push("/calendar");
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10">
      <div className="w-full max-w-md text-center space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          오늘 산책 완료!
        </h1>

        <div className="hover-lift">
          <ProfileCard name={pet.name} image={pet.image} size="md" />
        </div>

        <div className="hover-lift">
          <SummaryCard
            items={[
              { label: "총 산책시간", value: summary.total },
              { label: "시작시간", value: summary.start },
              { label: "종료시간", value: summary.end },
            ]}
          />
        </div>

        <div className="space-y-3">
          <Button onClick={handleSave} variant="primary" size="md">
            기록 저장하기
          </Button>
          <Button href="/start" variant="secondary-pink" size="md">
            처음으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
