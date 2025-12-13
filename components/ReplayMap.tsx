"use client";

import React, { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker } from "react-map-gl/maplibre";

export interface ReplayMapProps {
  path: [number, number][]; // Array of [longitude, latitude] coordinates
  height?: string;
  onReplayComplete?: () => void;
}

const ReplayMap: React.FC<ReplayMapProps> = ({
  path,
  height = "400px",
  onReplayComplete,
}) => {
  const mapRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedPath, setDisplayedPath] = useState<[number, number][]>([]);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    path.length > 0 ? path[0] : null
  );
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Initialize map center
  const [viewState, setViewState] = useState(() => {
    if (path.length > 0) {
      return {
        longitude: path[0][0],
        latitude: path[0][1],
        zoom: 15,
      };
    }
    return {
      longitude: 127.0276, // Default to Seoul
      latitude: 37.4979,
      zoom: 15,
    };
  });

  // Playback logic
  useEffect(() => {
    if (!isPlaying || isPaused || path.length === 0) return;

    const interval = 100; // Update every 100ms for smooth animation
    let animationFrameId: number;

    const animate = () => {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - pausedTimeRef.current;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const targetIndex = Math.floor((elapsed / interval) % path.length);

      if (targetIndex >= path.length) {
        // Replay completed
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentIndex(path.length - 1);
        setDisplayedPath([...path]);
        setMarkerPosition(path[path.length - 1]);
        startTimeRef.current = null;
        pausedTimeRef.current = 0;
        onReplayComplete?.();
        return;
      }

      setCurrentIndex(targetIndex);
      setDisplayedPath(path.slice(0, targetIndex + 1));
      setMarkerPosition(path[targetIndex]);

      // Update map center to follow marker
      if (path[targetIndex]) {
        setViewState((prev) => ({
          ...prev,
          longitude: path[targetIndex][0],
          latitude: path[targetIndex][1],
        }));
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    animationRef.current = animationFrameId;

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, isPaused, path, onReplayComplete]);

  const handlePlay = () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
    } else {
      // Start from beginning
      setCurrentIndex(0);
      setDisplayedPath([]);
      setMarkerPosition(path[0]);
      startTimeRef.current = null;
      pausedTimeRef.current = 0;
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (isPlaying && !isPaused) {
      setIsPaused(true);
      if (startTimeRef.current) {
        pausedTimeRef.current = Date.now() - startTimeRef.current;
      }
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(0);
    setDisplayedPath([]);
    setMarkerPosition(path[0]);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    if (path.length > 0) {
      setViewState({
        longitude: path[0][0],
        latitude: path[0][1],
        zoom: 15,
      });
    }
  };

  // Prepare GeoJSON for path line
  const pathGeoJSON = React.useMemo(() => {
    if (displayedPath.length === 0) return null;

    return {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: displayedPath,
      },
      properties: {},
    };
  }, [displayedPath]);

  // Update map source when path changes
  useEffect(() => {
    if (!mapRef.current || !pathGeoJSON) return;

    const map = mapRef.current.getMap();
    if (!map) return;

    const sourceId = "replay-path";
    const layerId = "replay-path-layer";

    // Wait for map to be fully loaded
    const updateSource = () => {
      if (!map.loaded()) {
        map.once("load", updateSource);
        return;
      }

      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as any).setData(pathGeoJSON);
      } else {
        map.addSource(sourceId, {
          type: "geojson",
          data: pathGeoJSON,
        });

        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#FF6B6B",
            "line-width": 4,
          },
        });
      }
    };

    updateSource();
  }, [pathGeoJSON]);

  if (path.length === 0) {
    return (
      <div
        style={{ height }}
        className="w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
      >
        <p className="text-gray-500">경로 데이터가 없습니다.</p>
      </div>
    );
  }

  const progress = path.length > 0 ? ((currentIndex + 1) / path.length) * 100 : 0;

  return (
    <div className="w-full space-y-4">
      {/* Map */}
      <div style={{ height }} className="relative rounded-lg overflow-hidden">
        <MapLibreMap
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={{
            version: 8,
            sources: {
              "raster-tiles": {
                type: "raster",
                tiles: [
                  "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                ],
                tileSize: 256,
                attribution: "© OpenStreetMap contributors"
              }
            },
            layers: [
              {
                id: "simple-tiles",
                type: "raster",
                source: "raster-tiles",
                minzoom: 0,
                maxzoom: 22
              }
            ]
          }}
          style={{ width: "100%", height: "100%" }}
          attributionControl={true}
          interactive={true}
        >
          {/* Marker */}
          {markerPosition && (
            <Marker longitude={markerPosition[0]} latitude={markerPosition[1]} anchor="center">
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: "#FF6B6B",
                  border: "3px solid white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              />
            </Marker>
          )}
        </MapLibreMap>
      </div>

      {/* Controls */}
      <div className="flex flex-col space-y-3">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-[#FF6B6B] h-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Control buttons */}
        <div className="flex justify-center space-x-3">
          <button
            onClick={handleRestart}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full font-semibold hover:bg-gray-300 transition active:scale-95"
          >
            처음부터
          </button>
          {isPlaying && !isPaused ? (
            <button
              onClick={handlePause}
              className="px-6 py-2 bg-[#F6C28B] text-gray-900 rounded-full font-semibold hover:bg-[#F4B877] transition active:scale-95"
            >
              일시정지
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="px-6 py-2 bg-[#A8DED0] text-gray-900 rounded-full font-semibold hover:bg-[#96D4C3] transition active:scale-95"
            >
              재생
            </button>
          )}
        </div>

        {/* Progress text */}
        <p className="text-center text-sm text-gray-600">
          {currentIndex + 1} / {path.length} 지점
        </p>
      </div>
    </div>
  );
};

export default ReplayMap;

