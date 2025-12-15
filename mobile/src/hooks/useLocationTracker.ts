import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { useWalkStore } from "../store/walkStore";
import { LOCATION_TASK_NAME } from "../tasks/locationTask";
import { loadTempWalk } from "../storage/walkStorage";

export function useLocationTracker() {
  const { isWalking, path, startTime, endTime, startWalk, endWalk } =
    useWalkStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timer | null>(null);

  // 권한 + 이전 임시 기록 복원
  useEffect(() => {
    (async () => {
      try {
        const fg = await Location.requestForegroundPermissionsAsync();
        const bg = await Location.requestBackgroundPermissionsAsync();
        setHasPermission(
          fg.status === "granted" && bg.status === "granted"
        );
      } catch (e) {
        console.warn("Location permission error", e);
        setHasPermission(false);
      }

      const temp = await loadTempWalk();
      if (temp && temp.startTime) {
        // 앱이 재시작된 경우를 대비해 경과 시간 복원
        setElapsed(temp.elapsed);
      }
    })();
  }, []);

  // 타이머
  useEffect(() => {
    if (isWalking && startTime && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 1000);
    }
    if (!isWalking && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isWalking, startTime]);

  const startTracking = async () => {
    if (!hasPermission) {
      console.warn("No location permission granted");
      return;
    }

    startWalk();
    setElapsed(0);

    try {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
        showsBackgroundLocationIndicator: true,
        pausesUpdatesAutomatically: false
      });
    } catch (e) {
      console.warn("Failed to start background location", e);
    }
  };

  const stopTracking = async () => {
    const started = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );
    if (started) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
    endWalk();
  };

  return {
    isWalking,
    path,
    startTime,
    endTime,
    elapsed,
    hasPermission,
    startTracking,
    stopTracking
  };
}


