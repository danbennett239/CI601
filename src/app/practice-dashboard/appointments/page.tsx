// app/practice-dashboard/appointments/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import AppointmentCalendar from "@/components/practice/AppointmentCalendar/AppointmentCalendar";
import styles from "./AppointmentsPage.module.css";

interface Appointment {
  id: number;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
}

interface OpeningHoursItem {
  open: string;     // e.g. "closed" or "08:15"
  close: string;    // e.g. "closed" or "17:30"
  dayName: string;  // e.g. "Monday"
}

const AppointmentsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("week");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHoursItem[]>([
    { open: "08:00", close: "16:00", dayName: "Monday" },
    { open: "08:00", close: "16:00", dayName: "Tuesday" },
    { open: "08:00", close: "16:00", dayName: "Wednesday" },
    { open: "08:00", close: "16:00", dayName: "Thursday" },
    { open: "08:00", close: "16:00", dayName: "Friday" },
    { open: "closed", close: "closed", dayName: "Saturday" },
    { open: "closed", close: "closed", dayName: "Sunday" }
]
);

  useEffect(() => {
    // BACKEND CALLS TO DO XYZ:
    // Fetch appointments (and optionally update openingHours) for the selected timeframe.
    console.log("Fetching appointments for timeframe:", timeframe);
    // For demonstration, using mocked appointment data:
    setAppointments([
      {
        id: 1,
        title: "Appointment 1",
        start: "2025-02-16T08:00:00", // Monday 8:00 AM
        end: "2025-02-16T08:30:00",
      },
      {
        id: 2,
        title: "Appointment 2",
        start: "2025-02-16T08:00:00", // Monday overlapping at 8:00 AM
        end: "2025-02-16T08:30:00",
      },
      {
        id: 3,
        title: "Appointment 3",
        start: "2025-02-16T08:00:00", // Monday overlapping at 8:00 AM
        end: "2025-02-16T08:30:00",
      },
      {
        id: 4,
        title: "Appointment 4",
        start: "2025-02-17T09:15:00", // Tuesday appointment
        end: "2025-02-17T10:00:00",
      },
    ]);
  }, [timeframe]);

  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeframe(e.target.value as "today" | "week" | "month");
  };

  return (
    <div className={styles.appointmentsPage}>
      <h1>Manage Appointments</h1>
      <div className={styles.filterContainer}>
        <label htmlFor="timeframe">Select Timeframe:</label>
        <select id="timeframe" value={timeframe} onChange={handleTimeframeChange}>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>
      <AppointmentCalendar
        timeframe={timeframe}
        appointments={appointments}
        openingHours={openingHours}
      />
    </div>
  );
};

export default AppointmentsPage;
