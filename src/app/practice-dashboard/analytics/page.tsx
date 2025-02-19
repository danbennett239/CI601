"use client";

import React, { useState, useEffect } from "react";
import styles from "./AnalyticsPage.module.css";
import { useUser } from "@/hooks/useUser";
import { usePractice } from "@/hooks/usePractice";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { analyticsDateSchema } from "@/schemas/analyticsSchemas";

const AppointmentsLineChart = dynamic(
  () => import("../../../components/practice/analytics/AppointmentsLineChart/AppointmentsLineChart"),
  { ssr: false }
);

const AppointmentsOverview = dynamic(
  () => import("../../../components/practice/analytics/AppointmentsOverview/AppointmentsOverview"),
  { ssr: false }
);

// Timeframe options
const TIMEFRAMES = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last Month", value: "1m" },
  { label: "Last 3 Months", value: "3m" },
  { label: "Last Year", value: "1y" },
  { label: "All Time", value: "all" },
  { label: "Custom", value: "custom" },
];


export default function AnalyticsPage() {
  const { user } = useUser();
  const { practice } = usePractice(user?.practice_id);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState("7d");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const practiceId = user?.practice_id;
  const practiceCreatedAt = practice?.created_at?.split("T")[0] || null; // Extract YYYY-MM-DD

  /**
   * Returns an object containing `start` and `end` dates
   * based on the selected timeframe.
   */
  function getDateRange() {
    const now = new Date();
    let startDate = "";
    let endDate = now.toISOString().split("T")[0]; // Today

    switch (timeframe) {
      case "7d":
        startDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split("T")[0];
        break;
      case "1m":
        startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split("T")[0];
        break;
      case "3m":
        startDate = new Date(now.setMonth(now.getMonth() - 3)).toISOString().split("T")[0];
        break;
      case "1y":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split("T")[0];
        break;
      case "all":
        startDate = practiceCreatedAt || ""; // Use practice's creation date
        break;
      case "custom":
        startDate = customStartDate || new Date().toISOString().split("T")[0]; // Default to today if empty
        endDate = customEndDate || new Date().toISOString().split("T")[0]; // Default to today if empty
        break;
    }

    return { start: startDate, end: endDate };
  }

  /**
   * Fetch appointments using selected timeframe or custom range
   */
  async function fetchAppointments() {
    if (!practiceId) return;
    setLoading(true);
    setError(null);

    try {
      const { start, end } = getDateRange();
      const params = new URLSearchParams();
      params.append("practiceId", practiceId);
      if (start) params.append("start_time", start);
      if (end) params.append("end_time", end);

      const res = await fetch(`/api/appointment?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch appointments.");
      }

      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, [practiceId, timeframe, customStartDate, customEndDate, practiceCreatedAt]);

  // Handle date change with validation
  function handleDateChange(type: "start" | "end", value: string) {
    const result = analyticsDateSchema.safeParse(value);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    if (type === "start") setCustomStartDate(value);
    if (type === "end") setCustomEndDate(value);
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Practice Analytics</h2>

      {/* Filter Controls */}
      <div className={styles.filters}>
        {/* Timeframe Dropdown */}
        <div className={styles.filterItem}>
          <label htmlFor="timeframe">Timeframe</label>
          <select
            id="timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className={styles.select}
          >
            {TIMEFRAMES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Show date pickers if "Custom" is selected */}
        {timeframe === "custom" && (
          <>
            <div className={styles.filterItem}>
              <label htmlFor="start-date">Start Date</label>
              <input
                id="start-date"
                type="date"
                value={customStartDate || new Date().toISOString().split("T")[0]} // Default to today
                onChange={(e) => handleDateChange("start", e.target.value)}
                max={new Date().toISOString().split("T")[0]} /* Prevent future dates */
              />
            </div>

            <div className={styles.filterItem}>
              <label htmlFor="end-date">End Date</label>
              <input
                id="end-date"
                type="date"
                value={customEndDate || new Date().toISOString().split("T")[0]} // Default to today
                onChange={(e) => handleDateChange("end", e.target.value)}
                max={new Date().toISOString().split("T")[0]} /* Prevent future dates */
              />
            </div>
          </>
        )}
      </div>

      {loading && <p className={styles.loading}>Loading appointments...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <>
          <AppointmentsOverview appointments={appointments} />
          <AppointmentsLineChart appointments={appointments} />
        </>
      )}
    </div>
  );
}
