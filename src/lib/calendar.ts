import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import { nl } from "date-fns/locale";

export interface CalendarDay {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function generateCalendarGrid(date: Date): CalendarDay[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return days.map((day) => ({
    date: day,
    dateString: format(day, "yyyy-MM-dd"),
    dayNumber: day.getDate(),
    isCurrentMonth: isSameMonth(day, date),
    isToday: isToday(day),
  }));
}

export function getMonthYear(date: Date): string {
  return format(date, "MMMM yyyy", { locale: nl });
}

export function navigateMonth(date: Date, direction: "prev" | "next"): Date {
  return direction === "next" ? addMonths(date, 1) : subMonths(date, 1);
}

export function isSameDateString(date1: string, date2: string): boolean {
  return date1 === date2;
}

export function isDateInRange(
  dateString: string,
  startDate: string,
  endDate: string | null
): boolean {
  if (!endDate) {
    return dateString === startDate;
  }
  return dateString >= startDate && dateString <= endDate;
}

export const WEEKDAY_LABELS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
