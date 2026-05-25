"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type BookingStatus = "occupied" | "reserved" | "requested";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  modifiers?: Record<string, boolean>;
}

export interface CalendarProps {
  initialDate?: Date;
  onDateSelect?: (date: Date) => void;
  showSelectedDateInfo?: boolean;
  className?: string;
  maxWidth?: string;
  // Compatibility with previous DayPicker props used across the app
  month?: Date;
  onMonthChange?: (d: Date) => void;
  selected?: Date | Date[];
  // simple modifiers API: arrays of Date
  modifiers?: {
    occupied?: Date[];
    reserved?: Date[];
    requested?: Date[];
    selectedDay?: Date[];
  };
  modifiersClassNames?: Record<string, string>;
  // compatibility props from previous Calendar/DayPicker API
  mode?: string;
  onDayClick?: (d: Date) => void;
}

function datesEqual(a?: Date | null, b?: Date | null) {
  if (!a || !b) return false;
  return a.toDateString() === b.toDateString();
}

export const Calendar: React.FC<CalendarProps> = ({
  initialDate = new Date(),
  onDateSelect,
  showSelectedDateInfo = false,
  className = "",
  maxWidth = "max-w-2xl",
  month,
  onMonthChange,
  selected,
  modifiers,
  modifiersClassNames,
  onDayClick,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(month ?? initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    Array.isArray(selected) ? selected[0] ?? null : (selected as Date) ?? null
  );

  useEffect(() => {
    if (month) setCurrentDate(month);
  }, [month]);

  useEffect(() => {
    if (selected) {
      setSelectedDate(Array.isArray(selected) ? (selected[0] as Date) : (selected as Date));
    }
  }, [selected]);

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const m = date.getMonth();
    const firstDay = new Date(year, m, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const dayModifiers: Record<string, boolean> = {};
      if (modifiers) {
        if (modifiers.occupied && modifiers.occupied.some((x) => datesEqual(x, d))) dayModifiers.occupied = true;
        if (modifiers.reserved && modifiers.reserved.some((x) => datesEqual(x, d))) dayModifiers.reserved = true;
        if (modifiers.requested && modifiers.requested.some((x) => datesEqual(x, d))) dayModifiers.requested = true;
        if (modifiers.selectedDay && modifiers.selectedDay.some((x) => datesEqual(x, d))) dayModifiers.selectedDay = true;
      }

      days.push({
        date: d,
        isCurrentMonth: d.getMonth() === m,
        isToday: d.toDateString() === today.toDateString(),
        isSelected: selectedDate ? d.toDateString() === selectedDate.toDateString() : false,
        modifiers: dayModifiers,
      });
    }

    return days;
  };

  const nextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(next);
    onMonthChange?.(next);
  };

  const prevMonth = () => {
    const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prev);
    onMonthChange?.(prev);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
    // forward compatibility
    onDayClick?.(date);
  };

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate, modifiers, selectedDate]);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getModifierClass = (d: CalendarDay) => {
    if (!d.modifiers) return "";
    if (d.modifiers.reserved) return modifiersClassNames?.reserved ?? "bg-emerald-100 text-emerald-900 rounded-full";
    if (d.modifiers.requested) return modifiersClassNames?.requested ?? "bg-amber-100 text-amber-900 rounded-full";
    if (d.modifiers.occupied) return modifiersClassNames?.occupied ?? "bg-rose-100 text-rose-900 rounded-full";
    if (d.modifiers.selectedDay) return modifiersClassNames?.selectedDay ?? "ring-2 ring-primary ring-offset-2 ring-offset-white rounded-full";
    return "";
  };

  return (
    <motion.div
      initial={{ scale: 0.98, y: 6, filter: "blur(6px)" }}
      animate={{ scale: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.35 }}
      className={cn("bg-white rounded-2xl shadow-sm p-6 w-full", maxWidth, className)}
    >
      {/* Header */}
      <motion.div initial={{ y: -6 }} animate={{ y: 0 }} className="flex items-center justify-between mb-6">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <motion.h1 key={currentDate.getMonth()} className="text-lg font-semibold text-primary">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </motion.h1>

        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="py-1 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        <AnimatePresence mode="popLayout">
          {days.map((day, idx) => (
            <motion.button
              key={`${day.date.toDateString()}-${idx}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleDateClick(day.date)}
              className={cn(
                "p-3 rounded-md text-center transition-all duration-150",
                day.isCurrentMonth ? "text-primary" : "text-muted-foreground",
                day.isToday ? "bg-secondary text-primary font-semibold" : "",
                day.isSelected && !day.isToday ? "bg-primary/10 text-primary font-semibold" : "",
                getModifierClass(day)
              )}
            >
              {day.date.getDate()}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {showSelectedDateInfo && selectedDate && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-muted-foreground">
          Selected: {selectedDate.toLocaleDateString()}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Calendar;
