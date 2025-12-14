import { PathPoint } from "./path.types";

export interface WalkingRecord {
  id: string;
  date: string; // YYYY-MM-DD format
  timestamp: number; // Full timestamp
  elapsedMinutes: number;
  elapsedSeconds: number; // Total seconds for accuracy
  distance: number; // in meters
  path: [number, number][]; // [longitude, latitude] coordinates for backward compatibility
  pathPoints?: PathPoint[]; // Full path points with accuracy
  goalAchieved: boolean;
  stamp: boolean;
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  steps?: number;
  avgSpeed?: number; // km/h
  maxSpeed?: number; // km/h
}

export interface WalkingStats {
  totalWalks: number;
  totalGoalAchievements: number;
  longestStreak: number;
  currentStreak: number;
}




