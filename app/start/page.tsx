"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useWeather } from "@/hooks/useWeather";
import { getTodayGoalProgress } from "@/utils/walkingData";
import { getPetProfile, PetProfile } from "@/types/pet.types";
import PetProfileCard from "@/components/PetProfileCard";

export default function StartPage() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const { weather, loading: weatherLoading } = useWeather(location?.lat || null, location?.lon || null);
  const [goalProgress, setGoalProgress] = useState({ current: 0, goal: 20, percentage: 0 });
  const [petProfile, setPetProfile] = useState<PetProfile | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Load pet profile
  useEffect(() => {
    setPetProfile(getPetProfile());
  }, []);

  // Update goal progress
  useEffect(() => {
    const progress = getTodayGoalProgress();
    setGoalProgress(progress);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Pet Profile */}
        {petProfile && <PetProfileCard profile={petProfile} />}

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          산책을 시작해볼까요?
        </h1>

        {/* Weather Display */}
        <div className="space-y-3">
          {weatherLoading && !weather ? (
            // Loading skeleton
            <div className="bg-white rounded-xl shadow-md border border-[#FBD3D3]/60 p-4">
              <div className="flex items-center justify-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="text-left space-y-2">
                  <div className="h-5 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ) : weather ? (
            <>
              <div className="bg-white rounded-xl shadow-md border border-[#FBD3D3]/60 p-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{weather.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{weather.weatherText}</div>
                    <div className="text-sm text-gray-600">
                      {weather.temperature}°C · 바람 {weather.windSpeed} km/h
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Alert Banner */}
              {weather.riskAlert && (
                <div
                  className="rounded-xl p-4 shadow-md border"
                  style={{
                    backgroundColor: weather.riskAlert.color,
                    borderColor: weather.riskAlert.color,
                  }}
                >
                  <p className="font-semibold text-gray-900">{weather.riskAlert.message}</p>
                </div>
              )}
            </>
          ) : (
            // Error or no weather state
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <div className="text-sm text-gray-500 text-center">
                날씨 정보를 불러올 수 없습니다
              </div>
            </div>
          )}
        </div>

        {/* Daily Goal Progress */}
        <div className="bg-white rounded-xl shadow-md border border-[#A8DED0]/60 p-4">
          <div className="text-left mb-2">
            <div className="text-sm text-gray-600">오늘의 목표</div>
            <div className="text-lg font-semibold text-gray-900">
              {goalProgress.current} / {goalProgress.goal}분
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-[#A8DED0] h-full transition-all duration-300 rounded-full"
              style={{ width: `${goalProgress.percentage}%` }}
            />
          </div>
          {goalProgress.percentage >= 100 && (
            <div className="text-sm text-[#A8DED0] font-semibold mt-2">
              ✅ 오늘 목표 달성!
            </div>
          )}
        </div>

        <Link
          href="/walking"
          className="block w-full bg-[#A8DED0] text-gray-900 font-semibold py-4 rounded-full shadow-md transition active:scale-95"
        >
          산책 시작하기
        </Link>
      </div>
    </div>
  );
}




