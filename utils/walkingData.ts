import { LocationPoint } from "@/lib/location";
import { formatDateToKey } from "@/utils/date";

export interface WalkingRecord {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // seconds
  distance: number; // meters
  path: LocationPoint[];
  coordinateCount: number; // number of coordinates in path
  hasStamp: boolean; // stamp flag
  petName: string;
  timestamp: string;
}

const STORAGE_KEY = "walkingHistory";

/**
 * Save walking record to localStorage
 */
export function saveWalkingRecord(record: Omit<WalkingRecord, "id" | "timestamp">): WalkingRecord {
  const fullRecord: WalkingRecord = {
    ...record,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };

  const existingRecords = getWalkingRecords();
  existingRecords.push(fullRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingRecords));

  return fullRecord;
}

/**
 * Migrate old record format to new format
 */
function migrateRecord(record: any): WalkingRecord {
  return {
    id: record.id || Date.now().toString(),
    date: record.date,
    startTime: record.startTime,
    endTime: record.endTime,
    duration: record.duration,
    distance: record.distance || 0,
    path: record.path || [],
    coordinateCount: record.coordinateCount || (record.path?.length || 0),
    hasStamp: record.hasStamp || false,
    petName: record.petName || "콩이",
    timestamp: record.timestamp || new Date().toISOString(),
  };
}

/**
 * Migrate old "walkRecords" key to new "walkingHistory" key
 */
function migrateOldRecords() {
  const oldKey = "walkRecords";
  const oldData = localStorage.getItem(oldKey);
  if (oldData && !localStorage.getItem(STORAGE_KEY)) {
    try {
      localStorage.setItem(STORAGE_KEY, oldData);
      console.log("Migrated old walking records to new key");
    } catch (e) {
      console.error("Failed to migrate old records:", e);
    }
  }
}

/**
 * Get all walking records from localStorage
 */
export function getWalkingRecords(): WalkingRecord[] {
  try {
    // Migrate old records if they exist
    migrateOldRecords();
    
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    // Migrate old records to new format
    return records.map(migrateRecord);
  } catch {
    return [];
  }
}

/**
 * Get walking records for a specific date
 */
export function getWalkingRecordsByDate(date: string): WalkingRecord[] {
  const records = getWalkingRecords();
  return records.filter((record) => record.date === date);
}

/**
 * Aggregate walking records by date
 */
export interface AggregatedWalkingRecord {
  date: string;
  totalDuration: number;
  totalDistance: number;
  coordinateCount: number;
  recordCount: number;
  firstStartTime: string;
  lastEndTime: string;
  allPaths: LocationPoint[];
  hasStamp: boolean;
}

export function aggregateWalkingRecordsByDate(): Record<string, AggregatedWalkingRecord> {
  const records = getWalkingRecords();
  const aggregated: Record<string, AggregatedWalkingRecord> = {};

  records.forEach((record) => {
    if (!aggregated[record.date]) {
      aggregated[record.date] = {
        date: record.date,
        totalDuration: 0,
        totalDistance: 0,
        coordinateCount: 0,
        recordCount: 0,
        firstStartTime: record.startTime,
        lastEndTime: record.endTime,
        allPaths: [],
        hasStamp: record.hasStamp,
      };
    }

    aggregated[record.date].totalDuration += record.duration;
    aggregated[record.date].totalDistance += record.distance;
    aggregated[record.date].coordinateCount += record.coordinateCount;
    aggregated[record.date].recordCount += 1;

    if (record.path && record.path.length > 0) {
      aggregated[record.date].allPaths.push(...record.path);
    }

    if (record.startTime < aggregated[record.date].firstStartTime) {
      aggregated[record.date].firstStartTime = record.startTime;
    }
    if (record.endTime > aggregated[record.date].lastEndTime) {
      aggregated[record.date].lastEndTime = record.endTime;
    }

    // If any record has a stamp, mark the date as having a stamp
    if (record.hasStamp) {
      aggregated[record.date].hasStamp = true;
    }
  });

  return aggregated;
}

/**
 * Create walking record from current walking session
 */
export function createWalkingRecord(
  startTime: Date,
  endTime: Date,
  duration: number,
  distance: number,
  path: LocationPoint[],
  petName: string,
  hasStamp: boolean = false
): Omit<WalkingRecord, "id" | "timestamp"> {
  const dateKey = formatDateToKey(endTime);
  const startTimeStr = `${String(startTime.getHours()).padStart(2, "0")}:${String(startTime.getMinutes()).padStart(2, "0")}`;
  const endTimeStr = `${String(endTime.getHours()).padStart(2, "0")}:${String(endTime.getMinutes()).padStart(2, "0")}`;

  return {
    date: dateKey,
    startTime: startTimeStr,
    endTime: endTimeStr,
    duration,
    distance,
    path,
    coordinateCount: path.length,
    hasStamp,
    petName,
  };
}

