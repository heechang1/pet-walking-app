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
  const { location, path, pathPoints, center, error, isTracking, startTracking, stopTracking } = useLocationTracker();
  const { steps, resetSteps, isSupported: stepCounterSupported } = useStepCounter();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0); // km/h
  const [avgSpeed, setAvgSpeed] = useState(0); // km/h
  const [maxSpeed, setMaxSpeed] = useState(0); // km/h
  const startTimeRef = useRef<number | null>(null);
  const previousLocationRef = useRef<PathPoint | null>(null);
  const speedHistoryRef = useRef<number[]>([]);
  const pet = getPetProfile();

  // Start tracking when component mounts
  useEffect(() => {
    startTracking();
    setIsTimerRunning(true);
    startTimeRef.current = Date.now();
    resetSteps(); // Reset step counter when starting
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking, resetSteps]);

  // Timer logic
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Calculate speed from path points
  useEffect(() => {
    if (!pathPoints || pathPoints.length < 2) {
      setCurrentSpeed(0);
      return;
    }

    const currentPoint = pathPoints[pathPoints.length - 1];
    const prevPoint = previousLocationRef.current;

    if (prevPoint && currentPoint.timestamp > prevPoint.timestamp) {
      const distance = calculateDistance(
        prevPoint.latitude,
        prevPoint.longitude,
        currentPoint.latitude,
        currentPoint.longitude
      ); // meters
      const timeDelta = (currentPoint.timestamp - prevPoint.timestamp) / 1000; // seconds

      if (timeDelta > 0) {
        const speedMs = distance / timeDelta; // m/s
        const speedKmh = speedMs * 3.6; // km/h
        setCurrentSpeed(speedKmh);

        // Update max speed
        setMaxSpeed((prev) => Math.max(prev, speedKmh));

        // Add to speed history for average calculation
        speedHistoryRef.current.push(speedKmh);
        if (speedHistoryRef.current.length > 100) {
          speedHistoryRef.current.shift(); // Keep last 100 readings
        }

        // Calculate average speed
        const sum = speedHistoryRef.current.reduce((a, b) => a + b, 0);
        setAvgSpeed(sum / speedHistoryRef.current.length);
      }
    }

    previousLocationRef.current = currentPoint;
  }, [pathPoints]);

  // Helper function to calculate distance (Haversine formula)
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Format time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleEndWalk = () => {
    stopTracking();
    setIsTimerRunning(false);
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
        avgSpeed,
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
            <span className="font-semibold text-gray-900">{currentSpeed.toFixed(1)} km/h</span>
          </div>
          {avgSpeed > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">평균 속도</span>
              <span className="font-semibold text-gray-900">{avgSpeed.toFixed(1)} km/h</span>
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

