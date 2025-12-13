import { PathPoint } from "@/types/path.types";
import { WalkingRecord } from "@/types/walking.types";

const WALKING_RECORDS_KEY = "walkingRecords";
const GOAL_RECORDS_KEY = "goalRecords";
const DAILY_GOAL_MINUTES = 20;

// Calculate total distance from path coordinates (in meters)
export function calculatePathDistance(path: [number, number][]): number {
  if (path.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < path.length; i++) {
    const [lon1, lat1] = path[i - 1];
    const [lon2, lat2] = path[i];
    totalDistance += haversineDistance(lat1, lon1, lat2, lon2);
  }
  return totalDistance;
}

// Helper function for distance calculation (used by calculatePathDistanceFromPoints)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return haversineDistance(lat1, lon1, lat2, lon2);
}

// Haversine formula to calculate distance between two coordinates
function haversineDistance(
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

// Format date to YYYY-MM-DD
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Format time to HH:MM
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Create a new walking record
export function createWalkingRecord(
  elapsedSeconds: number,
  path: [number, number][],
  startTimestamp?: number,
  endTimestamp?: number,
  pathPoints?: PathPoint[],
  steps?: number,
  avgSpeed?: number,
  maxSpeed?: number
): WalkingRecord {
  const now = new Date();
  const startDate = startTimestamp ? new Date(startTimestamp) : now;
  const endDate = endTimestamp ? new Date(endTimestamp) : now;

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const distance = pathPoints && pathPoints.length > 0 
    ? calculatePathDistanceFromPoints(pathPoints)
    : calculatePathDistance(path);
  const goalAchieved = elapsedMinutes >= DAILY_GOAL_MINUTES;

  const record: WalkingRecord = {
    id: `walk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: formatDate(startDate),
    timestamp: startTimestamp || Date.now(),
    elapsedMinutes,
    elapsedSeconds,
    distance,
    path,
    pathPoints,
    goalAchieved,
    stamp: true, // Always true for records that should show on calendar
    startTime: formatTime(startDate),
    endTime: formatTime(endDate),
    steps,
    avgSpeed,
    maxSpeed,
  };

  return record;
}

// Calculate distance from PathPoint array
function calculatePathDistanceFromPoints(pathPoints: PathPoint[]): number {
  if (pathPoints.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < pathPoints.length; i++) {
    const prev = pathPoints[i - 1];
    const curr = pathPoints[i];
    totalDistance += calculateDistance(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude
    );
  }
  return totalDistance;
}

// Save walking record to localStorage
export function saveWalkingRecord(record: WalkingRecord): void {
  try {
    const existingRecords = getAllWalkingRecords();
    existingRecords.push(record);
    localStorage.setItem(WALKING_RECORDS_KEY, JSON.stringify(existingRecords));

    // Also update goal records if goal was achieved
    if (record.goalAchieved) {
      const goalRecords = getGoalRecords();
      goalRecords[record.date] = true;
      localStorage.setItem(GOAL_RECORDS_KEY, JSON.stringify(goalRecords));
    }
  } catch (error) {
    console.error("Error saving walking record:", error);
  }
}

// Get all walking records
export function getAllWalkingRecords(): WalkingRecord[] {
  try {
    const recordsJson = localStorage.getItem(WALKING_RECORDS_KEY);
    if (!recordsJson) return [];
    return JSON.parse(recordsJson);
  } catch (error) {
    console.error("Error loading walking records:", error);
    return [];
  }
}

// Get walking records for a specific date
export function getWalkingRecordsByDate(date: string): WalkingRecord[] {
  const allRecords = getAllWalkingRecords();
  return allRecords.filter((record) => record.date === date);
}

// Get walking records for a date range
export function getWalkingRecordsByDateRange(
  startDate: string,
  endDate: string
): WalkingRecord[] {
  const allRecords = getAllWalkingRecords();
  return allRecords.filter(
    (record) => record.date >= startDate && record.date <= endDate
  );
}

// Check if a date has any walking records (has stamp)
export function hasWalkingRecord(date: string): boolean {
  const records = getWalkingRecordsByDate(date);
  return records.length > 0;
}

// Check if a date achieved the daily goal
export function hasGoalAchieved(date: string): boolean {
  const goalRecords = getGoalRecords();
  return goalRecords[date] === true;
}

// Get goal records (date -> boolean mapping)
export function getGoalRecords(): Record<string, boolean> {
  try {
    const recordsJson = localStorage.getItem(GOAL_RECORDS_KEY);
    if (!recordsJson) return {};
    return JSON.parse(recordsJson);
  } catch (error) {
    console.error("Error loading goal records:", error);
    return {};
  }
}

// Get total walking minutes for a specific date
export function getTotalMinutesForDate(date: string): number {
  const records = getWalkingRecordsByDate(date);
  return records.reduce((total, record) => total + record.elapsedMinutes, 0);
}

// Get total walking minutes for today
export function getTodayTotalMinutes(): number {
  const today = formatDate(new Date());
  return getTotalMinutesForDate(today);
}

// Check if today's goal is achieved
export function isTodayGoalAchieved(): boolean {
  const today = formatDate(new Date());
  return hasGoalAchieved(today);
}

// Get today's goal progress (current minutes / goal minutes)
export function getTodayGoalProgress(): { current: number; goal: number; percentage: number } {
  const current = getTodayTotalMinutes();
  const goal = DAILY_GOAL_MINUTES;
  const percentage = Math.min((current / goal) * 100, 100);
  return { current, goal, percentage };
}

// Delete a walking record by ID
export function deleteWalkingRecord(id: string): void {
  try {
    const records = getAllWalkingRecords();
    const filtered = records.filter((record) => record.id !== id);
    localStorage.setItem(WALKING_RECORDS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting walking record:", error);
  }
}

export { DAILY_GOAL_MINUTES };

