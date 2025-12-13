import { useState, useEffect, useCallback, useRef } from "react";
import { PathPoint } from "@/types/path.types";
import { pathPointsToCoordinates } from "@/types/path.types";

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface UseLocationTrackerReturn {
  location: LocationData | null;
  path: [number, number][]; // Array of [longitude, latitude] - for backward compatibility
  pathPoints: PathPoint[]; // Full path points with accuracy
  center: [number, number] | null; // Current center [longitude, latitude]
  error: string | null;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  clearPath: () => void;
}

export const useLocationTracker = (): UseLocationTrackerReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [pathPoints, setPathPoints] = useState<PathPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Convert pathPoints to coordinates array for backward compatibility
  const path: [number, number][] = pathPointsToCoordinates(pathPoints);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    if (watchIdRef.current !== null) {
      return; // Already tracking
    }

    setIsTracking(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 0,
          timestamp: position.timestamp,
        };
        setLocation(newLocation);
        const initialPoint: PathPoint = {
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          accuracy: newLocation.accuracy,
          timestamp: newLocation.timestamp,
        };
        setPathPoints([initialPoint]);
      },
      (err) => {
        setError(`Error getting location: ${err.message}`);
        setIsTracking(false);
      },
      options
    );

    // Watch position changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 0,
          timestamp: position.timestamp,
        };
        setLocation(newLocation);
        setPathPoints((prevPoints) => {
          // Only add if the position has changed significantly (at least 5 meters)
          const lastPoint = prevPoints[prevPoints.length - 1];
          if (lastPoint) {
            const distance = calculateDistance(
              lastPoint.latitude,
              lastPoint.longitude,
              newLocation.latitude,
              newLocation.longitude
            );
            // Only add if moved more than 5 meters
            if (distance < 5) {
              return prevPoints;
            }
          }
          const newPoint: PathPoint = {
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            accuracy: newLocation.accuracy,
            timestamp: newLocation.timestamp,
          };
          // Memory safety: limit to last 1000 points
          const updated = [...prevPoints, newPoint];
          return updated.length > 1000 ? updated.slice(-1000) : updated;
        });
      },
      (err) => {
        setError(`Error watching location: ${err.message}`);
        setIsTracking(false);
        watchIdRef.current = null;
      },
      options
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const clearPath = useCallback(() => {
    setPathPoints([]);
    setLocation(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Calculate center from current location (longitude, latitude)
  const center: [number, number] | null = location
    ? [location.longitude, location.latitude]
    : null;

  return {
    location,
    path, // Backward compatibility
    pathPoints,
    center,
    error,
    isTracking,
    startTracking,
    stopTracking,
    clearPath,
  };
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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

