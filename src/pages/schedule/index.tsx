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

interface Match {
  date: Date;
  team1: string;
  team2: string;
  time: string;
  tournament: string;
  stage?: string;
  venue?: string;
}

// FIFA 2026 World Cup Schedule
// Tournament dates: June 11 - July 19, 2026
const getMatchesForDate = (date: Date): Match[] => {
  const fifa2026Matches: Match[] = [
    // Group Stage - June 11-27, 2026
    { date: new Date(2026, 5, 11), team1: "Mexico", team2: "Canada", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Mexico City" },
    { date: new Date(2026, 5, 11), team1: "USA", team2: "Costa Rica", time: "17:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Los Angeles" },
    { date: new Date(2026, 5, 12), team1: "Brazil", team2: "Argentina", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "New York" },
    { date: new Date(2026, 5, 12), team1: "France", team2: "Germany", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Miami" },
    { date: new Date(2026, 5, 13), team1: "Spain", team2: "Italy", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Dallas" },
    { date: new Date(2026, 5, 13), team1: "England", team2: "Netherlands", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Toronto" },
    { date: new Date(2026, 5, 14), team1: "Portugal", team2: "Belgium", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Vancouver" },
    { date: new Date(2026, 5, 14), team1: "Croatia", team2: "Morocco", time: "17:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Seattle" },
    { date: new Date(2026, 5, 15), team1: "Japan", team2: "South Korea", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "San Francisco" },
    { date: new Date(2026, 5, 15), team1: "Uruguay", team2: "Colombia", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Philadelphia" },
    { date: new Date(2026, 5, 16), team1: "Senegal", team2: "Ghana", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Atlanta" },
    { date: new Date(2026, 5, 16), team1: "Egypt", team2: "Nigeria", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Boston" },
    { date: new Date(2026, 5, 17), team1: "Australia", team2: "New Zealand", time: "17:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Kansas City" },
    { date: new Date(2026, 5, 17), team1: "Saudi Arabia", team2: "Qatar", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Houston" },
    { date: new Date(2026, 5, 18), team1: "Iran", team2: "Iraq", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Chicago" },
    { date: new Date(2026, 5, 18), team1: "Poland", team2: "Denmark", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Montreal" },
    { date: new Date(2026, 5, 19), team1: "Switzerland", team2: "Serbia", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Denver" },
    { date: new Date(2026, 5, 19), team1: "Sweden", team2: "Norway", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Portland" },
    { date: new Date(2026, 5, 20), team1: "Chile", team2: "Ecuador", time: "17:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Nashville" },
    { date: new Date(2026, 5, 20), team1: "Peru", team2: "Paraguay", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Orlando" },
    { date: new Date(2026, 5, 21), team1: "Mexico", team2: "USA", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Mexico City" },
    { date: new Date(2026, 5, 21), team1: "Brazil", team2: "France", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "New York" },
    { date: new Date(2026, 5, 22), team1: "Argentina", team2: "Germany", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Miami" },
    { date: new Date(2026, 5, 22), team1: "Spain", team2: "England", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Dallas" },
    { date: new Date(2026, 5, 23), team1: "Italy", team2: "Netherlands", time: "17:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Toronto" },
    { date: new Date(2026, 5, 23), team1: "Portugal", team2: "Croatia", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Vancouver" },
    { date: new Date(2026, 5, 24), team1: "Belgium", team2: "Morocco", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Seattle" },
    { date: new Date(2026, 5, 24), team1: "Japan", team2: "Uruguay", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "San Francisco" },
    { date: new Date(2026, 5, 25), team1: "South Korea", team2: "Colombia", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Philadelphia" },
    { date: new Date(2026, 5, 25), team1: "Senegal", team2: "Egypt", time: "17:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Atlanta" },
    { date: new Date(2026, 5, 26), team1: "Ghana", team2: "Nigeria", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Boston" },
    { date: new Date(2026, 5, 26), team1: "Canada", team2: "Costa Rica", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Los Angeles" },
    { date: new Date(2026, 5, 27), team1: "Mexico", team2: "USA", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Group Stage", venue: "Chicago" },
    
    // Round of 32 - June 28 - July 2, 2026
    { date: new Date(2026, 5, 28), team1: "Group A Winner", team2: "Group B Runner-up", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "New York" },
    { date: new Date(2026, 5, 28), team1: "Group C Winner", team2: "Group D Runner-up", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Miami" },
    { date: new Date(2026, 5, 29), team1: "Group E Winner", team2: "Group F Runner-up", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Dallas" },
    { date: new Date(2026, 5, 29), team1: "Group G Winner", team2: "Group H Runner-up", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Toronto" },
    { date: new Date(2026, 5, 30), team1: "Group B Winner", team2: "Group A Runner-up", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Vancouver" },
    { date: new Date(2026, 5, 30), team1: "Group D Winner", team2: "Group C Runner-up", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Seattle" },
    { date: new Date(2026, 6, 1), team1: "Group F Winner", team2: "Group E Runner-up", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "San Francisco" },
    { date: new Date(2026, 6, 1), team1: "Group H Winner", team2: "Group G Runner-up", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Philadelphia" },
    { date: new Date(2026, 6, 2), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Atlanta" },
    { date: new Date(2026, 6, 2), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Round of 32", venue: "Boston" },
    
    // Round of 16 - July 3-6, 2026
    { date: new Date(2026, 6, 3), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "New York" },
    { date: new Date(2026, 6, 3), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "22:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "Miami" },
    { date: new Date(2026, 6, 4), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "Dallas" },
    { date: new Date(2026, 6, 4), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "Toronto" },
    { date: new Date(2026, 6, 5), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "Vancouver" },
    { date: new Date(2026, 6, 5), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "22:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "Seattle" },
    { date: new Date(2026, 6, 6), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "San Francisco" },
    { date: new Date(2026, 6, 6), team1: "Round of 32 Winner", team2: "Round of 32 Winner", time: "21:00", tournament: "FIFA World Cup 2026", stage: "Round of 16", venue: "Philadelphia" },
    
    // Quarter-finals - July 9-10, 2026
    { date: new Date(2026, 6, 9), team1: "Round of 16 Winner", team2: "Round of 16 Winner", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Quarter-finals", venue: "New York" },
    { date: new Date(2026, 6, 9), team1: "Round of 16 Winner", team2: "Round of 16 Winner", time: "22:00", tournament: "FIFA World Cup 2026", stage: "Quarter-finals", venue: "Miami" },
    { date: new Date(2026, 6, 10), team1: "Round of 16 Winner", team2: "Round of 16 Winner", time: "19:00", tournament: "FIFA World Cup 2026", stage: "Quarter-finals", venue: "Dallas" },
    { date: new Date(2026, 6, 10), team1: "Round of 16 Winner", team2: "Round of 16 Winner", time: "22:00", tournament: "FIFA World Cup 2026", stage: "Quarter-finals", venue: "Toronto" },
    
    // Semi-finals - July 14-15, 2026
    { date: new Date(2026, 6, 14), team1: "Quarter-final Winner", team2: "Quarter-final Winner", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Semi-finals", venue: "New York" },
    { date: new Date(2026, 6, 15), team1: "Quarter-final Winner", team2: "Quarter-final Winner", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Semi-finals", venue: "Miami" },
    
    // Third Place Match - July 18, 2026
    { date: new Date(2026, 6, 18), team1: "Semi-final Loser", team2: "Semi-final Loser", time: "18:00", tournament: "FIFA World Cup 2026", stage: "Third Place", venue: "Dallas" },
    
    // Final - July 19, 2026
    { date: new Date(2026, 6, 19), team1: "Semi-final Winner", team2: "Semi-final Winner", time: "20:00", tournament: "FIFA World Cup 2026", stage: "Final", venue: "New York" },
  ];

  return fifa2026Matches.filter((match) => isSameDay(match.date, date));
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
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                          {match.stage || match.tournament}
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
                      <div className="text-center text-sm text-muted-600 dark:text-muted-400 mb-2">
                        vs
                      </div>
                      <div className="text-sm font-semibold text-muted-800 dark:text-muted-100 text-center mb-2">
                        {match.team2}
                      </div>
                      {match.venue && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-muted-200 dark:border-muted-700">
                          <Icon
                            icon="mdi:map-marker"
                            className="h-3 w-3 text-muted-400"
                          />
                          <span className="text-xs text-muted-500 dark:text-muted-400">
                            {match.venue}
                          </span>
                        </div>
                      )}
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
