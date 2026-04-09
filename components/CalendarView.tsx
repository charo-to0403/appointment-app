"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
} from "date-fns";
import { ja } from "date-fns/locale";

interface Holiday {
  date: string;
  name: string;
}

interface CalendarViewProps {
  availableDates: string[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export default function CalendarView({
  availableDates,
  selectedDate,
  onSelectDate,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const today = startOfDay(new Date());

  useEffect(() => {
    fetch("/api/holidays")
      .then((res) => res.json())
      .then((data) => setHolidays(data.holidays || []))
      .catch(() => {});
  }, []);

  const holidayMap = new Map(holidays.map((h) => [h.date, h.name]));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weeks: Date[][] = [];
  let day = calStart;
  while (isBefore(day, calEnd) || isSameDay(day, calEnd)) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const dayNames = ["月", "火", "水", "木", "金", "土", "日"];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          {format(currentMonth, "yyyy年 M月", { locale: ja })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((name, i) => (
          <div
            key={name}
            className={`text-center text-sm font-medium py-2 ${
              i === 5 ? "text-blue-500" : i === 6 ? "text-red-500" : "text-gray-500"
            }`}
          >
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((d, idx) => {
          const dateStr = format(d, "yyyy-MM-dd");
          const isAvailable = availableDates.includes(dateStr);
          const isSelected = selectedDate === dateStr;
          const isCurrentMonth = isSameMonth(d, currentMonth);
          const isPast = isBefore(d, today);
          const isToday = isSameDay(d, today);
          const holidayName = holidayMap.get(dateStr);
          const isHoliday = !!holidayName;

          return (
            <button
              key={idx}
              disabled={!isAvailable || isPast || isHoliday}
              onClick={() => isAvailable && !isPast && !isHoliday && onSelectDate(dateStr)}
              title={holidayName || undefined}
              className={`
                relative aspect-square flex items-center justify-center rounded-lg text-sm transition-all
                ${!isCurrentMonth ? "text-gray-300" : ""}
                ${isHoliday && isCurrentMonth ? "bg-red-50 text-red-400 cursor-default" : ""}
                ${isSelected && !isHoliday ? "bg-blue-600 text-white font-bold shadow-md" : ""}
                ${isAvailable && !isPast && !isSelected && !isHoliday ? "bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium cursor-pointer" : ""}
                ${(!isAvailable || isPast) && !isSelected && !isHoliday ? "text-gray-300 cursor-default" : ""}
                ${isToday && !isSelected && !isHoliday ? "ring-2 ring-blue-400" : ""}
              `}
            >
              {format(d, "d")}
              {isAvailable && !isPast && !isHoliday && (
                <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-blue-400"}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
