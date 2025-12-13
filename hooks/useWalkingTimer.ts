import { useEffect, useState, useRef } from "react";

interface UseWalkingTimerOptions {
  autoStart?: boolean;
  onTick?: (seconds: number) => void;
}

export function useWalkingTimer({ autoStart = false, onTick }: UseWalkingTimerOptions = {}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Restore from localStorage
  useEffect(() => {
    const savedStartTime = localStorage.getItem("walkingStartTime");
    const savedElapsed = localStorage.getItem("walkingElapsed");
    const savedIsActive = localStorage.getItem("walkingIsActive");

    if (savedStartTime && savedIsActive === "true") {
      const startTime = new Date(savedStartTime);
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
      setIsActive(true);
      startTimeRef.current = startTime.getTime();
    } else if (savedStartTime) {
      const startTime = new Date(savedStartTime);
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
      setIsActive(true);
      startTimeRef.current = startTime.getTime();
      localStorage.setItem("walkingIsActive", "true");
    } else if (autoStart) {
      const startTime = new Date().toISOString();
      localStorage.setItem("walkingStartTime", startTime);
      localStorage.setItem("walkingElapsed", "0");
      localStorage.setItem("walkingIsActive", "true");
      startTimeRef.current = new Date().getTime();
      setElapsedSeconds(0);
      setIsActive(true);
    }
  }, [autoStart]);

  // Timer interval
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const newValue = prev + 1;
        localStorage.setItem("walkingElapsed", String(newValue));
        onTick?.(newValue);
        return newValue;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, onTick]);

  const start = () => {
    const startTime = new Date().toISOString();
    localStorage.setItem("walkingStartTime", startTime);
    localStorage.setItem("walkingElapsed", "0");
    localStorage.setItem("walkingIsActive", "true");
    startTimeRef.current = new Date().getTime();
    setElapsedSeconds(0);
    setIsActive(true);
  };

  const stop = () => {
    setIsActive(false);
    localStorage.setItem("walkingIsActive", "false");
  };

  const reset = () => {
    setIsActive(false);
    setElapsedSeconds(0);
    localStorage.removeItem("walkingStartTime");
    localStorage.removeItem("walkingElapsed");
    localStorage.removeItem("walkingIsActive");
    startTimeRef.current = null;
  };

  return {
    elapsedSeconds,
    isActive,
    start,
    stop,
    reset,
  };
}


