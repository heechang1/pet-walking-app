/**
 * Date formatting utilities
 */

/**
 * Format date to YYYY-MM-DD (local timezone)
 */
export function formatDateKey(year: number, month: number, day: number): string {
  const date = new Date(year, month, day);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Format Date object to YYYY-MM-DD (local timezone)
 */
export function formatDateToKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Get today's date key (YYYY-MM-DD)
 */
export function getTodayKey(): string {
  return formatDateToKey(new Date());
}

/**
 * Get month info for a given date
 */
export function getMonthInfo(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  return { daysInMonth, startingDayOfWeek, year, month };
}

/**
 * Get month name in Korean
 */
export function getMonthName(month: number): string {
  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
  ];
  return monthNames[month];
}

/**
 * Get day names in Korean
 */
export function getDayNames(): string[] {
  return ["일", "월", "화", "수", "목", "금", "토"];
}


