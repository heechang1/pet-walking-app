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
  currentSpeed: number; // km/h
  averageSpeed: number; // km/h
  startTracking: () => void;
  stopTracking: () => void;
  clearPath: () => void;
}

export const useLocationTracker = (): UseLocationTrackerReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [pathPoints, setPathPoints] = useState<PathPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0); // km/h
  const [averageSpeed, setAverageSpeed] = useState(0); // km/h
  const watchIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<PathPoint | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const speedHistoryRef = useRef<number[]>([]);
  const forceRefreshRef = useRef<(() => void) | null>(null);

  // Convert pathPoints to coordinates array for backward compatibility
  const path: [number, number][] = pathPointsToCoordinates(pathPoints);

  // Helper function to calculate distance
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
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
  };

  // Update path and calculate speed
  const updatePathAndSpeed = useCallback((newLocation: LocationData) => {
    const newPoint: PathPoint = {
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      accuracy: newLocation.accuracy,
      timestamp: newLocation.timestamp,
    };

    // Always update path points (reduced threshold for continuous updates)
    setPathPoints((prevPoints) => {
      // Check if this is a significant update (at least 1 meter to avoid noise)
      if (prevPoints.length > 0) {
        const lastPoint = prevPoints[prevPoints.length - 1];
        const distance = calculateDistance(
          lastPoint.latitude,
          lastPoint.longitude,
          newLocation.latitude,
          newLocation.longitude
        );
        // Only add if moved more than 1 meter (reduced from 5m for better tracking)
        if (distance < 1) {
          // Still update location even if path doesn't change
          return prevPoints;
        }
      }

      // Add new point
      const updated = [...prevPoints, newPoint];
      // Memory safety: limit to last 2000 points (increased for longer walks)
      return updated.length > 2000 ? updated.slice(-2000) : updated;
    });

    // Calculate speed
    if (lastPointRef.current && lastTimestampRef.current) {
      const distance = calculateDistance(
        lastPointRef.current.latitude,
        lastPointRef.current.longitude,
        newLocation.latitude,
        newLocation.longitude
      ); // meters

      const timeDelta = (newLocation.timestamp - lastTimestampRef.current) / 1000; // seconds

      if (timeDelta > 0 && timeDelta < 60) {
        // Only calculate if time delta is reasonable (less than 60 seconds)
        const speedMs = distance / timeDelta; // m/s
        const speedKmh = speedMs * 3.6; // km/h

        // Update current speed
        setCurrentSpeed(speedKmh);

        // Update speed history for average
        speedHistoryRef.current.push(speedKmh);
        if (speedHistoryRef.current.length > 100) {
          speedHistoryRef.current.shift(); // Keep last 100 readings
        }

        // Calculate average speed
        const sum = speedHistoryRef.current.reduce((a, b) => a + b, 0);
        setAverageSpeed(sum / speedHistoryRef.current.length);
      }
    }

    // Update refs for next calculation
    lastPointRef.current = newPoint;
    lastTimestampRef.current = newLocation.timestamp;
  }, []);

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
      maximumAge: 0, // Always get fresh position
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
        // Initialize refs for speed calculation
        lastPointRef.current = initialPoint;
        lastTimestampRef.current = newLocation.timestamp;
      },
      (err) => {
        setError(`Error getting location: ${err.message}`);
        setIsTracking(false);
      },
      options
    );

    // Force refresh function for visibility change
    const forceRefreshLocation = () => {
      if (navigator.geolocation && isTracking) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation: LocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy || 0,
              timestamp: position.timestamp,
            };
            setLocation(newLocation);
            updatePathAndSpeed(newLocation);
          },
          (err) => {
            console.error("Error refreshing location:", err);
          },
          options
        );
      }
    };
    forceRefreshRef.current = forceRefreshLocation;

    // Watch position changes with continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 0,
          timestamp: position.timestamp || Date.now(),
        };
        setLocation(newLocation);
        updatePathAndSpeed(newLocation);
      },
      (err) => {
        setError(`Error watching location: ${err.message}`);
        setIsTracking(false);
        watchIdRef.current = null;
      },
      options
    );

    // Handle page visibility changes (background/foreground)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isTracking) {
        // Force refresh when returning to page
        setTimeout(() => {
          forceRefreshLocation();
        }, 100);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isTracking, updatePathAndSpeed]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    // Clear speed tracking refs
    lastPointRef.current = null;
    lastTimestampRef.current = null;
    speedHistoryRef.current = [];
    setCurrentSpeed(0);
    setAverageSpeed(0);
    forceRefreshRef.current = null;
  }, []);

  const clearPath = useCallback(() => {
    setPathPoints([]);
    setLocation(null);
    lastPointRef.current = null;
    lastTimestampRef.current = null;
    speedHistoryRef.current = [];
    setCurrentSpeed(0);
    setAverageSpeed(0);
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
    currentSpeed,
    averageSpeed,
    startTracking,
    stopTracking,
    clearPath,
  };
};


