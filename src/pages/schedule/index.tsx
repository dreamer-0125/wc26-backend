"use client";
import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import Layout from "@/layouts/Default";
import { Icon } from "@iconify/react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";

// Example match data - replace with actual data from your API
const getMatchesForDate = (date: Date) => {
  // Example matches - replace with real data
  const matches = [
    {
      date: new Date(2024, 11, 15),
      team1: "Brazil",
      team2: "Argentina",
      time: "20:00",
      tournament: "FIFA World Cup 2026",
    },
    {
      date: new Date(2024, 11, 18),
      team1: "France",
      team2: "Germany",
      time: "18:00",
      tournament: "FIFA World Cup 2026",
    },
    {
      date: new Date(2024, 11, 20),
      team1: "Spain",
      team2: "Italy",
      time: "21:00",
      tournament: "FIFA World Cup 2026",
    },
  ];

  return matches.filter((match) => isSameDay(match.date, date));
};

const SchedulePage = () => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const selectedDateMatches = selectedDate
    ? getMatchesForDate(selectedDate)
    : [];

  return (
    <Layout title={t("Schedule")} color="muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-muted-800 dark:text-muted-100 mb-2">
            {t("Match Schedule")}
          </h1>
          <p className="text-muted-600 dark:text-muted-400">
            {t("View upcoming matches and events")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-muted-900 rounded-lg border border-muted-200 dark:border-muted-800 shadow-sm p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg hover:bg-muted-100 dark:hover:bg-muted-800 transition-colors"
                  aria-label="Previous month"
                >
                  <Icon
                    icon="solar:alt-arrow-left-bold-duotone"
                    className="h-5 w-5 text-muted-600 dark:text-muted-400"
                  />
                </button>
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-semibold text-muted-800 dark:text-muted-100">
                    {format(currentDate, "MMMM yyyy")}
                  </h2>
                  <button
                    onClick={goToToday}
                    className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    {t("Today")}
                  </button>
                </div>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-muted-100 dark:hover:bg-muted-800 transition-colors"
                  aria-label="Next month"
                >
                  <Icon
                    icon="solar:alt-arrow-right-bold-duotone"
                    className="h-5 w-5 text-muted-600 dark:text-muted-400"
                  />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-muted-500 dark:text-muted-400 py-2"
                    >
                      {day}
                    </div>
                  )
                )}

                {/* Calendar Days */}
                {calendarDays.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);
                  const dayMatches = getMatchesForDate(day);
                  const hasMatches = dayMatches.length > 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative p-2 rounded-lg text-sm transition-all
                        ${
                          !isCurrentMonth
                            ? "text-muted-300 dark:text-muted-700"
                            : "text-muted-700 dark:text-muted-300"
                        }
                        ${
                          isSelected
                            ? "bg-primary-500 text-white dark:bg-primary-600"
                            : isTodayDate
                              ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold"
                              : "hover:bg-muted-100 dark:hover:bg-muted-800"
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{format(day, "d")}</span>
                        {hasMatches && (
                          <div className="flex gap-1">
                            {dayMatches.slice(0, 3).map((_, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected
                                    ? "bg-white"
                                    : "bg-primary-500 dark:bg-primary-400"
                                }`}
                              />
                            ))}
                            {dayMatches.length > 3 && (
                              <span
                                className={`text-xs ${
                                  isSelected
                                    ? "text-white"
                                    : "text-primary-500 dark:text-primary-400"
                                }`}
                              >
                                +{dayMatches.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Matches List Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-muted-900 rounded-lg border border-muted-200 dark:border-muted-800 shadow-sm p-6">
              <h3 className="text-xl font-semibold text-muted-800 dark:text-muted-100 mb-4">
                {selectedDate
                  ? format(selectedDate, "EEEE, MMMM d")
                  : t("Select a date")}
              </h3>

              {selectedDateMatches.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateMatches.map((match, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-muted-200 dark:border-muted-800 bg-muted-50 dark:bg-muted-800/50 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon
                          icon="mdi:soccer"
                          className="h-4 w-4 text-primary-500"
                        />
                        <span className="text-xs font-medium text-muted-500 dark:text-muted-400">
                          {match.tournament}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-muted-800 dark:text-muted-100">
                          {match.team1}
                        </span>
                        <span className="text-xs text-muted-500 dark:text-muted-400">
                          {match.time}
                        </span>
                      </div>
                      <div className="text-center text-sm text-muted-600 dark:text-muted-400">
                        vs
                      </div>
                      <div className="text-sm font-semibold text-muted-800 dark:text-muted-100 text-center">
                        {match.team2}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon
                    icon="solar:calendar-mark-bold-duotone"
                    className="h-12 w-12 text-muted-300 dark:text-muted-700 mx-auto mb-3"
                  />
                  <p className="text-muted-500 dark:text-muted-400">
                    {selectedDate
                      ? t("No matches scheduled for this date")
                      : t("Select a date to view matches")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SchedulePage;
