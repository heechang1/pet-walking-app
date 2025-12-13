/**
 * GPS 위치 추적 유틸리티
 */

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

/**
 * 현재 위치 가져오기
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * 위치 추적 시작
 */
export function watchPosition(
  onSuccess: (position: GeolocationPosition) => void,
  onError?: (error: GeolocationPositionError) => void
): number | null {
  if (!navigator.geolocation) {
    onError?.(new Error("Geolocation is not supported") as any);
    return null;
  }

  return navigator.geolocation.watchPosition(
    onSuccess,
    onError || ((error) => console.error("Geolocation error:", error)),
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

/**
 * 위치 추적 중지
 */
export function clearWatch(watchId: number): void {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * 위치를 LocationPoint로 변환
 */
export function positionToPoint(
  position: GeolocationPosition
): LocationPoint {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    timestamp: position.timestamp,
    accuracy: position.coords.accuracy,
  };
}

/**
 * 두 지점 간 거리 계산 (미터 단위, Haversine 공식)
 */
export function calculateDistance(
  point1: LocationPoint,
  point2: LocationPoint
): number {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 미터
}

/**
 * 두 지점 간 거리 계산 (Haversine 공식) - calculateDistance의 별칭
 */
export const haversineDistance = calculateDistance;

/**
 * 경로의 총 거리 계산
 */
export function calculateTotalDistance(
  path: LocationPoint[]
): number {
  if (path.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < path.length; i++) {
    totalDistance += calculateDistance(path[i - 1], path[i]);
  }

  return totalDistance;
}

/**
 * 거리를 포맷팅 (미터 -> km)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
}


