"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { usePractice } from "@/hooks/usePractice";
import AppointmentCalendar from "@/components/practice/AppointmentCalendar/AppointmentCalendar";
import AppointmentPopup from "@/components/practice/AppointmentPopup/AppointmentPopup";
import CreateAppointmentPopup from "@/components/practice/CreateAppointmentPopup/CreateAppointmentPopup";
import { Appointment, OpeningHoursItem } from "@/types/practice";
import { ViewType } from "@/types/practice";
import styles from "./AppointmentsPage.module.css";

const AppointmentsPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  // Use the user’s practice_id to fetch practice data from the DB
  const { practice, loading: practiceLoading, error: practiceError } = usePractice(user?.practice_id);
  // Retrieve view from localStorage (default to "calendarWeek")
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
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  // Default start/end for the creation popup (will be overridden if a slot is clicked)
  const [createDefaults, setCreateDefaults] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(new Date().getTime() + 30 * 60000),
  });

  // Dummy practice ID (in a real app, you’d fetch this based on your verified practice user)

  useEffect(() => {
    // BACKEND CALLS TO DO XYZ:
    console.log("Fetching appointments for view:", view, "and date:", currentDate);
    // Replace the mocked data with a real fetch (for now we use mocked data)
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

  // When an appointment is clicked, open the detail popup.
  const handleAppointmentClick = (appointment: Appointment) => {
    console.log("Appointment clicked:", appointment);
    setSelectedAppointment(appointment);
  };

  // When an empty slot is clicked, open the creation popup with default start/end times.
  const handleSlotClick = (start: Date, end: Date) => {
    console.log("Empty slot clicked:", start, end);
    setCreateDefaults({ start, end });
    setShowCreatePopup(true);
  };

  // After creation, refresh appointments without changing the current view.
  const handleAppointmentCreated = (newAppointment: Appointment) => {
    setAppointments(prev => [...prev, newAppointment]);
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
        {/* Create Appointment button in the top right */}
        <button onClick={() => {
          // Set default times to “now” (or you could choose a rounded slot)
          setCreateDefaults({
            start: new Date(),
            end: new Date(new Date().getTime() + 30 * 60000)
          });
          setShowCreatePopup(true);
        }} className={styles.createButton}>
          Create Appointment
        </button>
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
      {showCreatePopup && (
        <CreateAppointmentPopup
          practiceId={practice?.practice_id || ""}
          openingHours={openingHours}
          defaultStart={createDefaults.start}
          defaultEnd={createDefaults.end}
          onClose={() => setShowCreatePopup(false)}
          onCreated={handleAppointmentCreated}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;