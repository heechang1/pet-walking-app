import { useEffect, useState, useRef, useCallback } from "react";
import {
  watchPosition,
  clearWatch,
  positionToPoint,
  LocationPoint,
  calculateTotalDistance,
  haversineDistance,
} from "@/lib/location";

interface UseLocationTrackerOptions {
  enabled?: boolean;
  minDistance?: number; // meters
  maxAccuracy?: number; // meters
  onLocationUpdate?: (point: LocationPoint, path: LocationPoint[]) => void;
}

export function useLocationTracker({
  enabled = false,
  minDistance = 5,
  maxAccuracy = 100,
  onLocationUpdate,
}: UseLocationTrackerOptions = {}) {
  const [path, setPath] = useState<LocationPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [distance, setDistance] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const pathRef = useRef<LocationPoint[]>([]);

  // Restore path from localStorage
  useEffect(() => {
    if (!enabled) return;

    const savedPath = localStorage.getItem("walkingPath");
    if (savedPath) {
      try {
        const parsedPath = JSON.parse(savedPath);
        pathRef.current = parsedPath;
        setPath(parsedPath);
        if (parsedPath.length > 0) {
          setCurrentLocation(parsedPath[parsedPath.length - 1]);
          setDistance(calculateTotalDistance(parsedPath));
        }
      } catch (e) {
        console.error("Failed to parse saved path:", e);
      }
    }
  }, [enabled]);

  // Start tracking
  useEffect(() => {
    if (!enabled) {
      if (watchIdRef.current !== null) {
        clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    const startTracking = async () => {
      try {
        // Get initial position
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0,
            });
          }
        );

        const initialPoint = positionToPoint(position);
        setCurrentLocation(initialPoint);
        setAccuracy(position.coords.accuracy);
        pathRef.current = [initialPoint];
        setPath([initialPoint]);
        localStorage.setItem("walkingPath", JSON.stringify([initialPoint]));

        // Start watching position
        const watchId = watchPosition(
          (position) => {
            const point = positionToPoint(position);
            setCurrentLocation(point);
            setAccuracy(position.coords.accuracy);

            // Filter by accuracy
            if (position.coords.accuracy > maxAccuracy) {
              return;
            }

            // Filter by minimum distance using point-to-point haversine distance
            const currentPath = pathRef.current;
            const lastPoint = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;
            const delta = lastPoint ? haversineDistance(lastPoint, point) : Infinity;

            if (delta > minDistance) {
              const newPath = [...currentPath, point];
              pathRef.current = newPath;
              setPath(newPath);
              localStorage.setItem("walkingPath", JSON.stringify(newPath));
              const totalDistance = calculateTotalDistance(newPath);
              setDistance(totalDistance);
              onLocationUpdate?.(point, newPath);
            }
          },
          (error) => {
            console.error("GPS error:", error);
            setError("위치 정보를 가져올 수 없습니다.");
          }
        );

        watchIdRef.current = watchId;
      } catch (error) {
        console.error("Failed to start GPS tracking:", error);
        setError("위치 권한이 필요합니다. 브라우저 설정에서 위치 권한을 허용해주세요.");
      }
    };

    startTracking();

    return () => {
      if (watchIdRef.current !== null) {
        clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, minDistance, maxAccuracy, onLocationUpdate]);

  const clearPath = useCallback(() => {
    pathRef.current = [];
    setPath([]);
    setDistance(0);
    setCurrentLocation(null);
    localStorage.removeItem("walkingPath");
  }, []);

  return {
    path,
    currentLocation,
    distance,
    accuracy,
    error,
    clearPath,
  };
}


