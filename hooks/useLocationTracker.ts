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
  const pathPointsRef = useRef<PathPoint[]>([]); // Ref to track path for localStorage
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

  // Update path - simplified without speed calculation
  const updatePath = useCallback((newLocation: LocationData) => {
    const newPoint: PathPoint = {
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      accuracy: newLocation.accuracy,
      timestamp: newLocation.timestamp,
    };

    // Update path points with 1-2 meter threshold
    setPathPoints((prevPoints) => {
      // Check if this is a significant update (1-2 meters to avoid noise but allow slow movement)
      if (prevPoints.length > 0) {
        const lastPoint = prevPoints[prevPoints.length - 1];
        const distance = calculateDistance(
          lastPoint.latitude,
          lastPoint.longitude,
          newLocation.latitude,
          newLocation.longitude
        );
        // Only add if moved more than 1.5 meters (balanced threshold)
        if (distance < 1.5) {
          // Still update location marker even if path doesn't change
          return prevPoints;
        }
      }

      // Add new point
      const updated = [...prevPoints, newPoint];
      // Update ref for localStorage
      pathPointsRef.current = updated;
      
      // Save to localStorage for background tracking
      try {
        localStorage.setItem("currentWalkPath", JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save path to localStorage:", e);
      }

      // Memory safety: limit to last 2000 points
      return updated.length > 2000 ? updated.slice(-2000) : updated;
    });

    // Always update location marker
    setLocation(newLocation);
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
        const initialPoint: PathPoint = {
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          accuracy: newLocation.accuracy,
          timestamp: newLocation.timestamp,
        };
        setLocation(newLocation);
        setPathPoints([initialPoint]);
        pathPointsRef.current = [initialPoint];
        
        // Save initial point to localStorage
        try {
          localStorage.setItem("currentWalkPath", JSON.stringify([initialPoint]));
        } catch (e) {
          console.warn("Failed to save initial path to localStorage:", e);
        }
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
              timestamp: position.timestamp || Date.now(),
            };
            updatePath(newLocation);
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
    // Keep watchPosition active even when page is backgrounded
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 0,
          timestamp: position.timestamp || Date.now(),
        };
        updatePath(newLocation);
      },
      (err) => {
        setError(`Error watching location: ${err.message}`);
        setIsTracking(false);
        watchIdRef.current = null;
      },
      options
    );

    // Handle page visibility changes (background/foreground)
    // Ensure localStorage updates continue even if tab is hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isTracking) {
        // Force refresh when returning to page
        setTimeout(() => {
          if (forceRefreshRef.current) {
            forceRefreshRef.current();
          }
        }, 100);
        
        // Restore path from localStorage if needed
        try {
          const savedPath = localStorage.getItem("currentWalkPath");
          if (savedPath) {
            const parsed = JSON.parse(savedPath) as PathPoint[];
            if (parsed.length > 0) {
              setPathPoints(parsed);
              pathPointsRef.current = parsed;
            }
          }
        } catch (e) {
          console.warn("Failed to restore path from localStorage:", e);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isTracking, updatePath]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    forceRefreshRef.current = null;
    
    // Clear localStorage path
    try {
      localStorage.removeItem("currentWalkPath");
    } catch (e) {
      console.warn("Failed to clear path from localStorage:", e);
    }
  }, []);

  const clearPath = useCallback(() => {
    setPathPoints([]);
    setLocation(null);
    pathPointsRef.current = [];
    
    // Clear localStorage path
    try {
      localStorage.removeItem("currentWalkPath");
    } catch (e) {
      console.warn("Failed to clear path from localStorage:", e);
    }
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


