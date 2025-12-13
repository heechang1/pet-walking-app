export interface PathPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface PathSegment {
  start: PathPoint;
  end: PathPoint;
  color: string;
}

// Accuracy color mapping
export function getAccuracyColor(accuracy: number): string {
  if (accuracy < 20) return "#28a745"; // green
  if (accuracy < 50) return "#ffca2c"; // yellow
  return "#dc3545"; // red
}

// Convert PathPoint[] to [longitude, latitude][] for map rendering
export function pathPointsToCoordinates(points: PathPoint[]): [number, number][] {
  return points.map((point) => [point.longitude, point.latitude]);
}

