/**
 * 초를 HH:MM:SS 형식으로 변환
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((val) => String(val).padStart(2, "0"))
    .join(":");
}

/**
 * 초를 "X분 Y초" 형식으로 변환
 */
export function formatTimeShort(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes === 0) {
    return `${secs}초`;
  }
  if (secs === 0) {
    return `${minutes}분`;
  }
  return `${minutes}분 ${secs}초`;
}

/**
 * 초를 "X시간 Y분" 형식으로 변환
 */
export function formatTimeLong(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}분`;
  }
  if (minutes === 0) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${minutes}분`;
}

/**
 * 현재 시간을 HH:MM 형식으로 반환
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * 로컬 시간대 기준으로 날짜를 YYYY-MM-DD 형식으로 변환
 */
export function formatDateKey(year: number, month: number, day: number): string {
  const date = new Date(year, month, day);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Date 객체를 로컬 시간대 기준으로 YYYY-MM-DD 형식으로 변환
 */
export function formatDateToKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getTodayKey(): string {
  return formatDateToKey(new Date());
}
