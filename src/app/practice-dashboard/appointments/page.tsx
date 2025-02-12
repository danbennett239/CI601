"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppointmentCalendar from "@/components/practice/AppointmentCalendar/AppointmentCalendar";
import AppointmentPopup from "@/components/practice/AppointmentPopup/AppointmentPopup";
import { Appointment, OpeningHoursItem } from "@/types/practice";
import { ViewType } from "@/types/practice";
import styles from "./AppointmentsPage.module.css";

const AppointmentsPage: React.FC = () => {
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

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    // BACKEND CALLS TO DO XYZ:
    console.log("Fetching appointments for view:", view, "and date:", currentDate);
    // For demonstration, we use mocked appointment data (note the 'booked' field):
    setAppointments([
      {
        id: 1,
        title: "Appointment 1",
        start: "2025-02-17T08:00:00",
        end: "2025-02-17T08:30:00",
        booked: false,
      },
      {
        id: 2,
        title: "Appointment 2",
        start: "2025-02-17T08:00:00",
        end: "2025-02-17T08:30:00",
        booked: true,
      },
      {
        id: 3,
        title: "Appointment 3",
        start: "2025-02-17T08:00:00",
        end: "2025-02-17T08:30:00",
        booked: false,
      },
      {
        id: 4,
        title: "Appointment 4",
        start: "2025-02-18T09:15:00",
        end: "2025-02-18T10:00:00",
        booked: false,
      },
    ]);
  }, [view, currentDate]);

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

  // When an appointment is clicked, store it as the selected appointment.
  const handleAppointmentClick = (appointment: Appointment) => {
    console.log("Appointment clicked:", appointment);
    setSelectedAppointment(appointment);
  };

  // Log the start and end time when a time slot is clicked.
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
      {selectedAppointment && (
        <AppointmentPopup
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
