"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import MapView from "@/components/MapView";
import { useLocationTracker } from "@/hooks/useLocationTracker";
import { useStepCounter } from "@/hooks/useStepCounter";
import { createWalkingRecord, saveWalkingRecord } from "@/utils/walkingData";
import { getPetProfile } from "@/types/pet.types";
import { PathPoint } from "@/types/path.types";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { insertWalk } from "@/lib/api/walks";
import { insertStamp } from "@/lib/api/stamps";
import { getPet } from "@/lib/api/pets";

export default function WalkingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    location, 
    path, 
    pathPoints, 
    center, 
    error, 
    isTracking, 
    startTracking, 
    stopTracking 
  } = useLocationTracker();
  const { steps, resetSteps, isSupported: stepCounterSupported } = useStepCounter();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [distance, setDistance] = useState(0); // meters
  const [petName, setPetName] = useState("반려동물");
  const startTimeRef = useRef<number | null>(null);

  // Load pet name
  useEffect(() => {
    const loadPetName = async () => {
      if (!user) return;
      
      const selectedPetId = localStorage.getItem("selectedPetId");
      if (selectedPetId) {
        try {
          const pet = await getPet(selectedPetId);
          if (pet) {
            setPetName(pet.name);
          } else {
            const localPet = getPetProfile();
            setPetName(localPet.name);
          }
        } catch (error) {
          const localPet = getPetProfile();
          setPetName(localPet.name);
        }
      } else {
        const localPet = getPetProfile();
        setPetName(localPet.name);
      }
    };
    
    loadPetName();
  }, [user]);

  // Calculate distance from path points
  const calculateDistance = (points: typeof pathPoints): number => {
    if (points.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      // Haversine formula
      const R = 6371e3; // Earth radius in meters
      const φ1 = (prev.latitude * Math.PI) / 180;
      const φ2 = (curr.latitude * Math.PI) / 180;
      const Δφ = ((curr.latitude - prev.latitude) * Math.PI) / 180;
      const Δλ = ((curr.longitude - prev.longitude) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      totalDistance += R * c;
    }
    
    return totalDistance;
  };

  // Update distance when path changes
  useEffect(() => {
    if (pathPoints.length > 1) {
      const calculatedDistance = calculateDistance(pathPoints);
      setDistance(calculatedDistance);
    }
  }, [pathPoints]);

  // Start tracking when component mounts
  useEffect(() => {
    startTracking();
    setIsTimerRunning(true);
    startTimeRef.current = Date.now();
    resetSteps(); // Reset step counter when starting
    
    // Handle page visibility for background tracking
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isTracking) {
        // Page became visible, ensure tracking is active
        console.log("Page visible, ensuring tracking is active");
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      stopTracking();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startTracking, stopTracking, resetSteps, isTracking]);

  // Timer logic
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleEndWalk = async () => {
    // Stop all tracking and timers first
    stopTracking();
    setIsTimerRunning(false);
    
    if (!user || !startTimeRef.current || path.length === 0) {
      router.push("/calendar");
      return;
    }

    try {
      const endTime = Date.now();
      const startTime = startTimeRef.current;
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      
      // Get selected pet ID
      const selectedPetId = localStorage.getItem("selectedPetId");
      if (!selectedPetId) {
        throw new Error("반려동물이 선택되지 않았습니다.");
      }

      // Verify pet belongs to user
      const pet = await getPet(selectedPetId);
      if (!pet || pet.user_id !== user.id) {
        throw new Error("유효하지 않은 반려동물입니다.");
      }

      // Calculate goal achieved (20 minutes = 1200 seconds)
      const goalAchieved = elapsedTime >= 1200;

      // Save walk to Supabase
      await insertWalk({
        pet_id: selectedPetId,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        duration_sec: elapsedTime,
        distance_m: distance,
        steps: steps || null,
        path: {
          coordinates: path,
          pathPoints: pathPoints,
        },
      });

      // Save or update calendar stamp
      const walkDate = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
      await insertStamp({
        pet_id: selectedPetId,
        walk_date: walkDate,
        stamp_count: 1,
        goal_achieved: goalAchieved,
      });

      // Also save to localStorage for backwards compatibility
      const record = createWalkingRecord(
        elapsedTime,
        path,
        startTime,
        endTime,
        pathPoints,
        steps,
        0, // avgSpeed - removed
        0  // maxSpeed - removed
      );
      saveWalkingRecord(record);

      const walkId = `walk_${Date.now()}`;
      localStorage.setItem(walkId, JSON.stringify({
        path,
        duration: elapsedTime,
        timestamp: startTime,
      }));
      localStorage.setItem("latestWalkId", walkId);

    } catch (error) {
      console.error("Error saving walk:", error);
      alert("산책 기록 저장 중 오류가 발생했습니다: " + (error as Error).message);
    }

    // Navigate to calendar page
    router.push("/calendar");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FFFDF8] px-6 py-10">
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {petName}와 산책 중…
          </h1>
          <div className="flex justify-center text-3xl space-x-2 text-[#FBD3D3]">
            <span>🐾</span>
            <span>🐾</span>
            <span className="animate-pulse">🐾</span>
          </div>
        </div>

        <div className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-widest">
          {formatTime(elapsedTime)}
        </div>

        {/* Stats Display */}
        <div className="bg-white rounded-xl shadow-md border border-[#A8DED0]/60 p-4 space-y-3">
          {stepCounterSupported && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">걸음 수</span>
              <span className="font-semibold text-gray-900">{steps} 걸음</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">거리</span>
            <span className="font-semibold text-gray-900">
              {distance >= 1000 
                ? `${(distance / 1000).toFixed(2)} km` 
                : `${Math.round(distance)} m`}
            </span>
          </div>
          {location && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">위치 정확도</span>
              <span className="font-semibold text-gray-900">
                {location.accuracy ? `${Math.round(location.accuracy)} m` : "측정 중"}
              </span>
            </div>
          )}
        </div>

        {/* Map View */}
        <div className="w-full">
          <MapView
            path={path}
            pathPoints={pathPoints}
            center={center || undefined}
            showPath={true}
            showMarker={true}
            height="250px"
            followUser={true}
          />
          {error && (
            <p className="text-sm text-red-600 mt-2">
              위치 오류: {error}
            </p>
          )}
        </div>

        <button
          onClick={handleEndWalk}
          className="block w-full bg-[#F6C28B] text-gray-900 font-semibold py-4 rounded-full shadow-md transition active:scale-95"
        >
          산책 종료
        </button>
      </div>
    </div>
    </AuthGuard>
  );
}

