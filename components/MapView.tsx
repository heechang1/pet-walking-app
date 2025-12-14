"use client";

import React, { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker, NavigationControl, GeolocateControl } from "react-map-gl/maplibre";
import { PathPoint } from "@/types/path.types";
import { getAccuracyColor } from "@/types/path.types";

export interface MapViewProps {
  path?: [number, number][]; // Array of [longitude, latitude] coordinates - for backward compatibility
  pathPoints?: PathPoint[]; // Full path points with accuracy for color-coding
  center?: [number, number]; // [longitude, latitude]
  showPath?: boolean;
  showMarker?: boolean;
  height?: string;
  followUser?: boolean; // Automatically center map on user location
}

const MapView: React.FC<MapViewProps> = ({
  path = [],
  pathPoints,
  center,
  showPath = true,
  showMarker = true,
  height = "250px",
  followUser = false,
}) => {
  const mapRef = useRef<any>(null);
  
  interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
  }
  
  const [viewState, setViewState] = useState<ViewState | null>(() => {
    // Only use center if provided, otherwise don't initialize with default
    if (center) {
      return {
        longitude: center[0],
        latitude: center[1],
        zoom: 15,
      };
    }
    // Return null initially if no center
    return null;
  });
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    center ? [center[0], center[1]] : null
  );
  const animationFrameRef = useRef<number | null>(null);
  const previousMarkerRef = useRef<[number, number] | null>(null);

  // Initialize or update viewport when center prop changes
  useEffect(() => {
    if (center) {
      setViewState((prev: ViewState | null) => {
        const currentZoom = prev?.zoom || 15;
        // If followUser is true, always update to follow the user
        // If followUser is false, only update if viewState is not initialized
        if (followUser || !prev) {
          return {
            longitude: center[0],
            latitude: center[1],
            zoom: currentZoom,
          };
        }
        return prev;
      });
    }
  }, [center, followUser]);

  // Update marker position with smooth animation
  useEffect(() => {
    if (center && showMarker) {
      const targetPos: [number, number] = [center[0], center[1]];

      // Cancel any ongoing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // If there's a previous position, animate smoothly
      if (previousMarkerRef.current) {
        const [prevLng, prevLat] = previousMarkerRef.current;
        const [targetLng, targetLat] = targetPos;
        const duration = 500; // 500ms animation
        const startTime = Date.now();
        const startLng = prevLng;
        const startLat = prevLat;

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Easing function (ease-out)
          const easeOut = 1 - Math.pow(1 - progress, 3);

          const currentLng = startLng + (targetLng - startLng) * easeOut;
          const currentLat = startLat + (targetLat - startLat) * easeOut;

          setMarkerPosition([currentLng, currentLat]);

          if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(animate);
          } else {
            setMarkerPosition(targetPos);
            previousMarkerRef.current = targetPos;
            animationFrameRef.current = null;
          }
        };

        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // No previous position, set immediately
        setMarkerPosition(targetPos);
        previousMarkerRef.current = targetPos;
      }

      // Update map center if followUser is enabled (handled in viewState useEffect)
    }
  }, [center, showMarker, followUser]);

  // Prepare GeoJSON for path line with color segments
  const pathGeoJSON = React.useMemo(() => {
    if (!showPath) return null;

    // Use pathPoints if available (for accuracy-based coloring), otherwise fallback to path
    if (pathPoints && pathPoints.length > 0) {
      // Create segments grouped by accuracy color
      const segments: Array<{ coordinates: [number, number][]; color: string }> = [];
      let currentSegment: [number, number][] = [];
      let currentColor = "";

      for (let i = 0; i < pathPoints.length; i++) {
        const point = pathPoints[i];
        const color = getAccuracyColor(point.accuracy);
        const coord: [number, number] = [point.longitude, point.latitude];

        if (i === 0) {
          currentColor = color;
          currentSegment = [coord];
        } else {
          const prevColor = getAccuracyColor(pathPoints[i - 1].accuracy);
          if (color === prevColor) {
            // Same color, continue segment
            currentSegment.push(coord);
          } else {
            // Color changed, save previous segment and start new one
            if (currentSegment.length > 0) {
              segments.push({ coordinates: currentSegment, color: prevColor });
            }
            currentSegment = [pathPoints[i - 1] ? [pathPoints[i - 1].longitude, pathPoints[i - 1].latitude] : coord, coord];
            currentColor = color;
          }
        }
      }

      // Add last segment
      if (currentSegment.length > 0) {
        segments.push({ coordinates: currentSegment, color: currentColor });
      }

      // Create FeatureCollection with multiple LineString features
      return {
        type: "FeatureCollection" as const,
        features: segments.map((segment, idx) => ({
          type: "Feature" as const,
          geometry: {
            type: "LineString" as const,
            coordinates: segment.coordinates,
          },
          properties: {
            color: segment.color,
            id: idx,
          },
        })),
      };
    } else if (path.length > 0) {
      // Fallback to simple path without color coding
      return {
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: path,
        },
        properties: {},
      };
    }

    return null;
  }, [path, pathPoints, showPath]);

  // Update map source when path changes
  useEffect(() => {
    if (!mapRef.current || !pathGeoJSON) return;

    const map = mapRef.current.getMap();
    if (!map || !map.loaded()) return;

    const sourceId = "walking-path";
    const layerId = "walking-path-layer";

    // Wait for map to be fully loaded
    const updateSource = () => {
      if (!map.loaded()) {
        map.once("load", updateSource);
        return;
      }

      // Check if source exists
      const isFeatureCollection = pathGeoJSON.type === "FeatureCollection";
      
      if (map.getSource(sourceId)) {
        // Source exists, update data
        (map.getSource(sourceId) as any).setData(pathGeoJSON);
        
        // If switching to FeatureCollection, we may need to recreate layers
        if (isFeatureCollection) {
          const features = (pathGeoJSON as any).features;
          // Remove old single layer if it exists
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
          // Add/update segment layers
          features.forEach((feature: any, idx: number) => {
            const segmentLayerId = `${layerId}-${idx}`;
            if (!map.getLayer(segmentLayerId)) {
              map.addLayer({
                id: segmentLayerId,
                type: "line",
                source: sourceId,
                filter: ["==", ["get", "id"], idx],
                layout: {
                  "line-join": "round",
                  "line-cap": "round",
                },
                paint: {
                  "line-color": feature.properties.color,
                  "line-width": 4,
                  "line-dasharray": [2, 2], // Dotted polyline
                },
              });
            }
          });
        } else {
          // Switching to simple path, remove segment layers
          const existingLayers = map.getStyle().layers || [];
          existingLayers.forEach((layer: any) => {
            if (layer.id && layer.id.startsWith(`${layerId}-`)) {
              map.removeLayer(layer.id);
            }
          });
          // Add simple layer if it doesn't exist
          if (!map.getLayer(layerId)) {
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
                "line-dasharray": [2, 2], // Dotted polyline
              },
            });
          }
        }
      } else {
        // Add source
        map.addSource(sourceId, {
          type: "geojson",
          data: pathGeoJSON,
        });

        // Check if it's a FeatureCollection (accuracy-based) or simple Feature
        const isFeatureCollection = pathGeoJSON.type === "FeatureCollection";

        if (isFeatureCollection) {
          // For FeatureCollection with multiple segments, add layers for each color
          const features = (pathGeoJSON as any).features;
          features.forEach((feature: any, idx: number) => {
            const segmentLayerId = `${layerId}-${idx}`;
            if (!map.getLayer(segmentLayerId)) {
              map.addLayer({
                id: segmentLayerId,
                type: "line",
                source: sourceId,
                filter: ["==", ["get", "id"], idx],
                layout: {
                  "line-join": "round",
                  "line-cap": "round",
                },
                paint: {
                  "line-color": feature.properties.color,
                  "line-width": 4,
                  "line-dasharray": [2, 2], // Dotted polyline
                },
              });
            }
          });
        } else {
          // Simple path without color coding
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
              "line-dasharray": [2, 2], // Dotted polyline
            },
          });
        }
      }
    };

    updateSource();
  }, [pathGeoJSON, pathPoints?.length]); // Add pathPoints length to trigger continuous updates

  // Don't render map if no center position
  if (!viewState || !center) {
    return (
      <div style={{ height, width: "100%", position: "relative" }} className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-sm">위치 정보를 가져오는 중...</p>
      </div>
    );
  }

  return (
    <div style={{ height, width: "100%", position: "relative" }} className="rounded-lg overflow-hidden border border-gray-200">
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
        attributionControl={false}
      >
        {/* Navigation controls */}
        <NavigationControl position="top-right" />
        
        {/* Current position marker */}
        {showMarker && markerPosition && (
          <Marker
            longitude={markerPosition[0]}
            latitude={markerPosition[1]}
            anchor="center"
          >
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
  );
};

export default MapView;

