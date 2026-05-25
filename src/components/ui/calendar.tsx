"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
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
  dayAvailabilityCounts?: Record<string, number>;
  showDayAvailabilityCounts?: boolean;
  colorByAvailability?: boolean;
  // compatibility props from previous Calendar/DayPicker API
  mode?: string;
  onDayClick?: (d: Date) => void;
  /** If provided, controls the initial collapsed state. If undefined, reads localStorage 'calendar-collapsed'. */
  startCollapsed?: boolean;
  collapsible?: boolean;
  disableBookedDates?: boolean;
  disablePastDates?: boolean;
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
  dayAvailabilityCounts,
  showDayAvailabilityCounts = false,
  colorByAvailability = false,
  onDayClick,
  startCollapsed,
  collapsible = true,
  disableBookedDates = true,
  disablePastDates = false,
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
    if (d.modifiers.reserved) return modifiersClassNames?.reserved ?? "bg-rose-600 text-white rounded-full";
    if (d.modifiers.requested) return modifiersClassNames?.requested ?? "bg-amber-100 text-amber-900 rounded-full";
    if (d.modifiers.occupied) return modifiersClassNames?.occupied ?? "bg-rose-600 text-white rounded-full";
    if (d.modifiers.selectedDay) return modifiersClassNames?.selectedDay ?? "ring-2 ring-primary ring-offset-2 ring-offset-white rounded-full";
    return "";
  };

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      if (typeof (startCollapsed as any) !== 'undefined') return startCollapsed as boolean;
    } catch (e) {
      // ignore
    }

    try {
      const v = typeof window !== 'undefined' ? window.localStorage.getItem('calendar-collapsed') : null;
      return v === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('calendar-collapsed', collapsed ? 'true' : 'false');
      }
    } catch (e) {
      // ignore
    }
  }, [collapsed]);

  return (
    <motion.div
      initial={{ scale: 0.98, y: 6, filter: "blur(6px)" }}
      animate={{ scale: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.35 }}
      className={cn("bg-white rounded-2xl shadow-sm p-3 sm:p-6 w-full", maxWidth, className)}
    >
      {collapsible ? (
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="mb-4 flex w-full items-center justify-between rounded-2xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-left"
        >
          <div className="text-sm font-semibold text-primary">Check Availability</div>
          <ChevronDown className={`h-5 w-5 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      ) : null}

      <AnimatePresence>
        {(!collapsible || !collapsed) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
            {/* Header */}
            <motion.div initial={{ y: -6 }} animate={{ y: 0 }} className="mb-4 flex items-center justify-between sm:mb-6">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} onClick={prevMonth} className="rounded-full p-2 transition-colors hover:bg-gray-100">
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>

              <motion.h1 key={currentDate.getMonth()} className="text-base font-semibold text-primary sm:text-lg">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </motion.h1>

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} onClick={nextMonth} className="rounded-full p-2 transition-colors hover:bg-gray-100">
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>
            </motion.div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 sm:mb-3">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="py-1 text-center text-[0.65rem] font-medium text-muted-foreground sm:text-xs">
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              <AnimatePresence mode="popLayout">
                {days.map((day, idx) => {
                  const dayKey = format(day.date, 'yyyy-MM-dd');
                  const availabilityCount = dayAvailabilityCounts?.[dayKey];
                  const isFullyBooked = typeof availabilityCount === 'number'
                    ? availabilityCount <= 0
                    : !!day.modifiers?.occupied || !!day.modifiers?.reserved;
                  const isPastDate = disablePastDates && isBefore(day.date, startOfDay(new Date()));
                  const isDisabled = isPastDate || (disableBookedDates && isFullyBooked);
                  return (
                    <motion.button
                      key={`${day.date.toDateString()}-${idx}`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      whileHover={{ scale: isDisabled ? 1 : 1.03 }}
                      whileTap={{ scale: isDisabled ? 1 : 0.96 }}
                      onClick={() => !isDisabled && handleDateClick(day.date)}
                      disabled={isDisabled}
                      className={cn(
                        "aspect-square rounded-md p-1 text-center text-sm transition-all duration-150 sm:p-3",
                        day.isCurrentMonth ? "text-primary" : "text-muted-foreground",
                        (showDayAvailabilityCounts || colorByAvailability) && typeof availabilityCount === 'number' && availabilityCount <= 0 ? 'bg-rose-500/15 text-rose-800' : '',
                        (showDayAvailabilityCounts || colorByAvailability) && typeof availabilityCount === 'number' && availabilityCount === 1 ? 'bg-orange-500/15 text-orange-800' : '',
                        (showDayAvailabilityCounts || colorByAvailability) && typeof availabilityCount === 'number' && availabilityCount === 2 ? 'bg-amber-500/15 text-amber-800' : '',
                        (showDayAvailabilityCounts || colorByAvailability) && typeof availabilityCount === 'number' && availabilityCount >= 3 ? 'bg-emerald-500/15 text-emerald-800' : '',
                        isPastDate ? 'bg-slate-300 text-slate-700 cursor-not-allowed opacity-85' : '',
                        day.isToday ? "ring-2 ring-primary/15" : "",
                        day.isSelected && !day.isToday ? "bg-primary/10 text-primary font-semibold" : "",
                        getModifierClass(day),
                        isDisabled ? 'opacity-70 cursor-not-allowed' : ''
                      )}
                    >
                      <span className="block text-[0.95em] font-semibold leading-none">{day.date.getDate()}</span>
                      {showDayAvailabilityCounts && typeof availabilityCount === 'number' ? (
                        <span className={cn(
                          'mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.15em]',
                          availabilityCount <= 0 ? 'bg-rose-500/10 text-rose-700' : availabilityCount <= 2 ? 'bg-amber-500/10 text-amber-700' : 'bg-emerald-500/10 text-emerald-700'
                        )}>
                          {availabilityCount <= 0 ? 'Full' : `${availabilityCount} left`}
                        </span>
                      ) : null}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(!collapsible || !collapsed) && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-rose-600" />
            <span>Unavailable / Reserved</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full border border-emerald-600 bg-emerald-100" />
            <span>Requested</span>
          </span>
        </div>
      )}

      {showSelectedDateInfo && selectedDate && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-muted-foreground">
          Selected: {format(selectedDate, 'dd-MM-yyyy')}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Calendar;
