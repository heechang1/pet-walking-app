"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import TimerDisplay from "@/components/TimerDisplay";
import Button from "@/components/Button";
import Stamp from "@/components/Stamp";
import { formatTime } from "@/utils/time";
import { useWalkingTimer } from "@/hooks/useWalkingTimer";
import { useLocationTracker } from "@/hooks/useLocationTracker";
import { createWalkingRecord, saveWalkingRecord } from "@/utils/walkingData";

// MapView를 동적으로 import (SSR 방지)
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-lg h-[250px]">
      <p className="text-gray-600">지도를 불러오는 중...</p>
    </div>
  ),
});
import { formatDistance } from "@/lib/location";

const pet = {
  name: "콩이",
};

export default function WalkingPage() {
  const router = useRouter();
  const { elapsedSeconds, isActive, start, stop } = useWalkingTimer({
    autoStart: true,
  });
  const { path, currentLocation, distance, accuracy, error: gpsError } =
    useLocationTracker({
      enabled: isActive,
      minDistance: 5,
      maxAccuracy: 100,
    });

  const handleEnd = () => {
    stop();

    const endTime = new Date();
    const startTimeStr = localStorage.getItem("walkingStartTime");
    if (!startTimeStr) return;

    const startTime = new Date(startTimeStr);
    const elapsed = elapsedSeconds;

    // Create and save walking record
    const record = createWalkingRecord(
      startTime,
      endTime,
      elapsed,
      distance,
      path,
      pet.name,
      false // stamp will be added in calendar
    );

    saveWalkingRecord(record);

    // Clear walking state
    localStorage.removeItem("walkingStartTime");
    localStorage.removeItem("walkingEndTime");
    localStorage.removeItem("walkingElapsed");
    localStorage.removeItem("walkingIsActive");
    localStorage.removeItem("walkingPath");

    // Navigate to calendar
    router.push("/calendar");
  };

  const mapCenter: [number, number] | undefined = currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : undefined;

  const getAccuracyMessage = () => {
    if (!accuracy) return null;
    if (accuracy < 10) return "정확도: 매우 정확 (GPS)";
    if (accuracy < 50) return "정확도: 정확 (GPS/Wi-Fi)";
    if (accuracy < 100) return "정확도: 보통 (Wi-Fi/셀타워)";
    return "정확도: 낮음 (IP 기반)";
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] px-4 sm:px-6 py-8 sm:py-10">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {pet.name}와 산책 중…
          </h1>
          <div className="flex justify-center text-3xl space-x-3 text-[#FBD3D3]">
            <span className="paw-animation inline-block" style={{ animationDelay: "0ms" }}>
              <Stamp size="lg" />
            </span>
            <span className="paw-animation inline-block" style={{ animationDelay: "400ms" }}>
              <Stamp size="lg" />
            </span>
            <span className="paw-animation inline-block" style={{ animationDelay: "800ms" }}>
              <Stamp size="lg" />
            </span>
          </div>
        </div>

        {/* Map */}
        {path.length > 0 && (
          <div className="space-y-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <MapView
                path={path}
                center={mapCenter}
                height="250px"
                showPath={true}
                showMarker={true}
              />
            </div>
            {gpsError && (
              <p className="text-sm text-red-500 text-center animate-fadeIn">
                {gpsError}
              </p>
            )}
            {accuracy && (
              <p className="text-xs text-gray-500 text-center">
                {getAccuracyMessage()} (±{Math.round(accuracy)}m)
              </p>
            )}
            {distance > 0 && (
              <p className="text-sm text-gray-600 text-center font-medium">
                이동 거리: {formatDistance(distance)}
              </p>
            )}
          </div>
        )}

        {/* Timer */}
        <div className="text-center bg-white rounded-2xl shadow-md p-6">
          <TimerDisplay time={formatTime(elapsedSeconds)} />
        </div>

        {/* End button */}
        <Button onClick={handleEnd} variant="secondary-orange" size="md">
          산책 종료
        </Button>
      </div>
    </div>
  );
}
