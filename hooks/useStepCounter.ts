import { useState, useEffect, useRef } from "react";

export interface StepCounterReturn {
  steps: number;
  resetSteps: () => void;
  isSupported: boolean;
}

/**
 * Step counter using Device Motion API
 * Uses peak detection algorithm to count steps
 */
export function useStepCounter(): StepCounterReturn {
  const [steps, setSteps] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const lastAccelerationRef = useRef<number | null>(null);
  const peakThreshold = 0.5; // Acceleration threshold for step detection
  const lastStepTimeRef = useRef<number>(0);
  const minStepInterval = 300; // Minimum ms between steps (max ~2 steps/sec)

  useEffect(() => {
    // Check if Device Motion API is supported
    if (
      typeof window === "undefined" ||
      !("DeviceMotionEvent" in window) ||
      typeof (DeviceMotionEvent as any).requestPermission !== "undefined"
    ) {
      // iOS 13+ requires permission
      if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
        (DeviceMotionEvent as any)
          .requestPermission()
          .then((response: string) => {
            if (response === "granted") {
              setIsSupported(true);
              startMotionTracking();
            }
          })
          .catch(() => {
            setIsSupported(false);
          });
      } else {
        // Android or older iOS
        setIsSupported(true);
        startMotionTracking();
      }
    } else {
      setIsSupported(false);
    }

    function startMotionTracking() {
      const handleMotion = (event: DeviceMotionEvent) => {
        const acceleration = event.accelerationIncludingGravity;
        if (!acceleration) return;

        // Calculate total acceleration magnitude
        const totalAccel = Math.sqrt(
          Math.pow(acceleration.x || 0, 2) +
            Math.pow(acceleration.y || 0, 2) +
            Math.pow(acceleration.z || 0, 2)
        );

        const now = Date.now();

        // Peak detection algorithm
        if (lastAccelerationRef.current !== null) {
          // Detect peak (local maximum)
          if (
            totalAccel > lastAccelerationRef.current &&
            totalAccel > peakThreshold &&
            now - lastStepTimeRef.current > minStepInterval
          ) {
            setSteps((prev) => prev + 1);
            lastStepTimeRef.current = now;
          }
        }

        lastAccelerationRef.current = totalAccel;
      };

      window.addEventListener("devicemotion", handleMotion);

      return () => {
        window.removeEventListener("devicemotion", handleMotion);
      };
    }

    if (isSupported) {
      return startMotionTracking();
    }
  }, [isSupported]);

  const resetSteps = () => {
    setSteps(0);
    lastAccelerationRef.current = null;
    lastStepTimeRef.current = 0;
  };

  return {
    steps,
    resetSteps,
    isSupported,
  };
}


