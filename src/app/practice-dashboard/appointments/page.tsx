"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppointmentCalendar, { ViewType } from "@/components/practice/AppointmentCalendar/AppointmentCalendar";
import styles from "./AppointmentsPage.module.css";

interface Appointment {
  id: number;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
}

interface OpeningHoursItem {
  open: string;    // e.g. "closed" or "08:15"
  close: string;   // e.g. "closed" or "17:30"
  dayName: string; // e.g. "Monday"
}

const AppointmentsPage: React.FC = () => {
  // Retrieve view from localStorage if available, else default to "calendarWeek"
  const initialView =
    typeof window !== "undefined" && localStorage.getItem("appointmentView")
      ? (localStorage.getItem("appointmentView") as ViewType)
      : "calendarWeek";

  const [view, setView] = useState<ViewType>(initialView);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHoursItem[]>([
    { open: "08:00", close: "16:00", dayName: "Monday" },
    { open: "08:00", close: "16:00", dayName: "Tuesday" },
    { open: "08:00", close: "16:00", dayName: "Wednesday" },
    { open: "08:00", close: "16:00", dayName: "Thursday" },
    { open: "08:00", close: "16:00", dayName: "Friday" },
    { open: "closed", close: "closed", dayName: "Saturday" },
    { open: "closed", close: "closed", dayName: "Sunday" }
]);

  useEffect(() => {
    // BACKEND CALLS TO DO XYZ:
    console.log("Fetching appointments for view:", view, "and date:", currentDate);
    // For demonstration, using mocked appointment data:
    setAppointments([
      {
        id: 1,
        title: "Appointment 1",
        start: "2025-02-17T08:00:00", // Monday 8:00 AM (example)
        end: "2025-02-17T08:30:00",
      },
      {
        id: 2,
        title: "Appointment 2",
        start: "2025-02-17T08:00:00", // overlapping appointment on Monday
        end: "2025-02-17T08:30:00",
      },
      {
        id: 3,
        title: "Appointment 3",
        start: "2025-02-17T08:00:00", // overlapping appointment on Monday
        end: "2025-02-17T08:30:00",
      },
      {
        id: 4,
        title: "Appointment 4",
        start: "2025-02-18T09:15:00", // Tuesday appointment
        end: "2025-02-18T10:00:00",
      },
    ]);
  }, [view, currentDate]);

  // Save the view selection to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("appointmentView", view);
  }, [view]);

  const handleViewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setView(e.target.value as ViewType);
  };

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === "calendarWeek" || view === "workWeek") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === "calendarWeek" || view === "workWeek") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Callback when an appointment is clicked
  const handleAppointmentClick = (appointment: Appointment) => {
    console.log("Appointment clicked:", appointment);
  };

  // Callback when an empty slot is clicked
  const handleSlotClick = (start: Date, end: Date) => {
    console.log("Empty slot clicked:", start, end);
  };

  return (
    <div className={styles.appointmentsPage}>
      <Link href="/practice-dashboard" className={styles.backButton}>
        Back to Practice Dashboard
      </Link>
      <h1>Manage Appointments</h1>
      <div className={styles.controls}>
        <select value={view} onChange={handleViewChange}>
          <option value="day">Day</option>
          <option value="calendarWeek">Calendar Week (Mon–Sun)</option>
          <option value="workWeek">Work Week (Mon–Fri)</option>
          <option value="month">Month</option>
        </select>
        <button onClick={goToPrevious}>Previous</button>
        <button onClick={goToNext}>Next</button>
      </div>
      <AppointmentCalendar
        view={view}
        currentDate={currentDate}
        appointments={appointments}
        openingHours={openingHours}
        onAppointmentClick={handleAppointmentClick}
        onSlotClick={handleSlotClick}
      />
    </div>
  );
};

export default AppointmentsPage;
