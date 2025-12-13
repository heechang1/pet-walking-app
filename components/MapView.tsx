"use client";

import { useEffect, useRef, useState, useMemo, memo } from "react";
import { LocationPoint } from "@/lib/location";

interface MapViewProps {
  path: LocationPoint[];
  center?: [number, number]; // [latitude, longitude]
  height?: string;
  showPath?: boolean;
  showMarker?: boolean;
}

function MapViewComponent({
  path,
  center,
  height = "300px",
  showPath = true,
  showMarker = true,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [leaflet, setLeaflet] = useState<any>(null);
  const initializedRef = useRef(false);
  const lastPathLengthRef = useRef(0);
  const lastPathIdRef = useRef<string>("");
  const hasFittedBoundsRef = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // path의 고유 ID 생성 (마지막 점의 좌표 기반)
  const pathId = useMemo(() => {
    if (path.length === 0) return "";
    const last = path[path.length - 1];
    return `${path.length}-${last.latitude.toFixed(6)}-${last.longitude.toFixed(6)}`;
  }, [path]);

  useEffect(() => {
    // 동적 import로 Leaflet 로드
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      try {
        const L = await import("leaflet");
        
        // CSS는 동적으로 추가
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          link.crossOrigin = "";
          document.head.appendChild(link);
        }

        setLeaflet(L.default || L);
        setMapLoaded(true);
      } catch (error) {
        console.error("Failed to load Leaflet:", error);
      }
    };

    loadLeaflet();
  }, []);

  // 지도 초기화 (한 번만)
  useEffect(() => {
    if (!mapLoaded || !leaflet || !mapRef.current || initializedRef.current) return;

    const defaultCenter: [number, number] = center || [37.5665, 126.9780]; // 서울 기본값
    
    try {
      const map = leaflet.map(mapRef.current, {
        zoomControl: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
      });
      
      map.setView(defaultCenter, 15);
      mapInstanceRef.current = map;

      // 타일 레이어 추가 (OpenStreetMap)
      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        })
        .addTo(map);

      initializedRef.current = true;
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    // 정리 함수
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.error("Error cleaning up map:", e);
        }
        mapInstanceRef.current = null;
        initializedRef.current = false;
        hasFittedBoundsRef.current = false;
      }
    };
  }, [mapLoaded, leaflet, center]);

  // 경로 업데이트 (pathId가 변경되었을 때만, debounce 적용)
  useEffect(() => {
    if (!mapInstanceRef.current || !leaflet || path.length === 0) return;

    // pathId가 실제로 변경되지 않았으면 업데이트하지 않음
    if (pathId === lastPathIdRef.current) {
      return;
    }

    // 이전 timeout 취소
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // debounce: 100ms 후에 업데이트 (너무 빠른 업데이트 방지)
    updateTimeoutRef.current = setTimeout(() => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const isNewPath = path.length < lastPathLengthRef.current || lastPathLengthRef.current === 0;

      // 경로 좌표 변환
      const pathCoordinates = path.map(
        (p) => [p.latitude, p.longitude] as [number, number]
      );

      // 폴리라인 업데이트
      if (showPath) {
        if (isNewPath || !polylineRef.current) {
          // 새 경로이거나 폴리라인이 없으면 새로 생성
          if (polylineRef.current) {
            map.removeLayer(polylineRef.current);
          }

          if (path.length > 1) {
            const polyline = leaflet.polyline(pathCoordinates, {
              color: "#A8DED0",
              weight: 5,
              opacity: 0.8,
            }).addTo(map);

            polylineRef.current = polyline;

            // 처음 한 번만 fitBounds 호출
            if (!hasFittedBoundsRef.current && path.length > 1) {
              const bounds = polyline.getBounds();
              map.fitBounds(bounds, { padding: [20, 20] });
              hasFittedBoundsRef.current = true;
            }
          }
        } else if (polylineRef.current && path.length > 1) {
          // 기존 폴리라인이 있으면 좌표만 업데이트 (깜빡임 방지)
          try {
            polylineRef.current.setLatLngs(pathCoordinates);
          } catch (e) {
            // 업데이트 실패 시 재생성
            map.removeLayer(polylineRef.current);
            const polyline = leaflet.polyline(pathCoordinates, {
              color: "#A8DED0",
              weight: 5,
              opacity: 0.8,
            }).addTo(map);
            polylineRef.current = polyline;
          }
        }
      }

      // 시작점 마커 업데이트 (새 경로일 때만)
      if (showMarker && path.length > 0) {
        if (!startMarkerRef.current || isNewPath) {
          if (startMarkerRef.current) {
            map.removeLayer(startMarkerRef.current);
          }

          const startIcon = leaflet.divIcon({
            className: "custom-marker-start",
            html: '<div style="background-color: #A8DED0; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const startMarker = leaflet
            .marker([path[0].latitude, path[0].longitude], {
              icon: startIcon,
            })
            .addTo(map)
            .bindPopup("시작점");

          startMarkerRef.current = startMarker;
        }
      }

      // 종료점 마커 업데이트
      if (showMarker && path.length > 1) {
        const lastPoint = path[path.length - 1];
        
        if (!endMarkerRef.current) {
          const endIcon = leaflet.divIcon({
            className: "custom-marker-end",
            html: '<div style="background-color: #FBD3D3; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const endMarker = leaflet
            .marker([lastPoint.latitude, lastPoint.longitude], {
              icon: endIcon,
            })
            .addTo(map)
            .bindPopup("종료점");

          endMarkerRef.current = endMarker;
        } else {
          // 종료점 마커 위치만 업데이트 (깜빡임 방지)
          endMarkerRef.current.setLatLng([lastPoint.latitude, lastPoint.longitude]);
        }
      } else if (endMarkerRef.current) {
        // 경로가 1개 이하면 종료점 마커 제거
        map.removeLayer(endMarkerRef.current);
        endMarkerRef.current = null;
      }

      // 이전 경로 정보 저장
      lastPathLengthRef.current = path.length;
      lastPathIdRef.current = pathId;
    }, 100);

    // cleanup
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [pathId, leaflet, showPath, showMarker, path]);

  if (!mapLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <p className="text-gray-600">지도를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full rounded-lg overflow-hidden border border-gray-200"
      style={{ height, minHeight: height }}
    />
  );
}

// React.memo로 메모이제이션하여 불필요한 리렌더링 방지
// path 배열의 실제 내용이 변경되었을 때만 리렌더링
export default memo(MapViewComponent, (prevProps, nextProps) => {
  // path가 실제로 변경되었는지 확인
  if (prevProps.path.length !== nextProps.path.length) {
    return false; // 길이가 다르면 리렌더링
  }
  
  if (prevProps.path.length > 0 && nextProps.path.length > 0) {
    const prevLast = prevProps.path[prevProps.path.length - 1];
    const nextLast = nextProps.path[nextProps.path.length - 1];
    
    // 마지막 점이 다르면 리렌더링
    if (
      Math.abs(prevLast.latitude - nextLast.latitude) > 0.000001 ||
      Math.abs(prevLast.longitude - nextLast.longitude) > 0.000001
    ) {
      return false;
    }
  }
  
  // 다른 props도 비교
  if (prevProps.showPath !== nextProps.showPath) return false;
  if (prevProps.showMarker !== nextProps.showMarker) return false;
  if (prevProps.height !== nextProps.height) return false;
  
  // center 비교
  if (prevProps.center && nextProps.center) {
    if (
      Math.abs(prevProps.center[0] - nextProps.center[0]) > 0.000001 ||
      Math.abs(prevProps.center[1] - nextProps.center[1]) > 0.000001
    ) {
      return false;
    }
  } else if (prevProps.center !== nextProps.center) {
    return false;
  }
  
  // 변경사항이 없으면 리렌더링하지 않음
  return true;
});
