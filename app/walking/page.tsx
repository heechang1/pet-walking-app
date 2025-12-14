"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import MapView from "@/components/MapView";
import { useLocationTracker } from "@/hooks/useLocationTracker";
import { useStepCounter } from "@/hooks/useStepCounter";
import { createWalkingRecord, saveWalkingRecord } from "@/utils/walkingData";
import { getPetProfile } from "@/types/pet.types";
import { PathPoint } from "@/types/path.types";

export default function WalkingPage() {
  const router = useRouter();
  const { 
    location, 
    path, 
    pathPoints, 
    center, 
    error, 
    isTracking, 
    currentSpeed: trackerSpeed,
    averageSpeed: trackerAvgSpeed,
    startTracking, 
    stopTracking 
  } = useLocationTracker();
  const { steps, resetSteps, isSupported: stepCounterSupported } = useStepCounter();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [maxSpeed, setMaxSpeed] = useState(0); // km/h
  const startTimeRef = useRef<number | null>(null);
  const pet = getPetProfile();

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

  // Update max speed from tracker speed
  useEffect(() => {
    if (trackerSpeed > 0) {
      setMaxSpeed((prev) => Math.max(prev, trackerSpeed));
    }
  }, [trackerSpeed]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleEndWalk = () => {
    // Stop all tracking and timers first
    stopTracking();
    setIsTimerRunning(false);
    
    // Small delay to ensure all state updates complete
    setTimeout(() => {
      const endTime = Date.now();
      
      // Save walking record if we have a path
      if (path.length > 0 && startTimeRef.current) {
        const record = createWalkingRecord(
          elapsedTime,
          path,
          startTimeRef.current,
          endTime,
          pathPoints, // Pass pathPoints for enhanced data
          steps,
          trackerAvgSpeed,
          maxSpeed
        );
        saveWalkingRecord(record);
        
        // Also save for replay functionality (backwards compatibility)
        const walkId = `walk_${Date.now()}`;
        localStorage.setItem(walkId, JSON.stringify({
          path,
          duration: elapsedTime,
          timestamp: startTimeRef.current,
        }));
        localStorage.setItem("latestWalkId", walkId);
      }
      
      // Navigate to calendar page
      router.push("/calendar");
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] px-6 py-10">
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {pet.name}와 산책 중…
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
            <span className="text-gray-600">현재 속도</span>
            <span className="font-semibold text-gray-900">{trackerSpeed.toFixed(1)} km/h</span>
          </div>
          {trackerAvgSpeed > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">평균 속도</span>
              <span className="font-semibold text-gray-900">{trackerAvgSpeed.toFixed(1)} km/h</span>
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
  );
}

