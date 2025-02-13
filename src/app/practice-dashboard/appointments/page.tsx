// app/practice-dashboard/appointments/page.tsx
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
import { getMonday } from "@/lib/utils/calendar"; // utility used in computing week ranges
import styles from "./AppointmentsPage.module.css";

type TimeRange = { start_time: string; end_time: string };

function computeTimeRange(date: Date, view: ViewType): TimeRange {
  let start: Date, end: Date;
  if (view === "day") {
    start = new Date(date);
    start.setHours(0, 0, 0, 0);
    end = new Date(date);
    end.setHours(23, 59, 59, 999);
  } else if (view === "calendarWeek" || view === "workWeek") {
    const monday = getMonday(date);
    start = new Date(monday);
    start.setHours(0, 0, 0, 0);
    end = new Date(monday);
    // workWeek: Monday to Friday, calendarWeek: Monday to Sunday
    const addDays = view === "workWeek" ? 4 : 6;
    end.setDate(end.getDate() + addDays);
    end.setHours(23, 59, 59, 999);
  } else if (view === "month") {
    start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
    end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  } else {
    start = date;
    end = date;
  }
  return { start_time: start.toISOString().split("Z")[0], end_time: end.toISOString().split("Z")[0] };
}

const AppointmentsPage: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const { practice, loading: practiceLoading } = usePractice(user?.practice_id);

  const initialView =
    typeof window !== "undefined" && localStorage.getItem("appointmentView")
      ? (localStorage.getItem("appointmentView") as ViewType)
      : "calendarWeek";

  const [view, setView] = useState<ViewType>(initialView);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(new Date().getTime() + 30 * 60000),
  });

  // Use practice opening_hours if available; otherwise fall back to defaults.
  const openingHours: OpeningHoursItem[] = practice?.opening_hours || [
    { open: "08:00", close: "16:00", dayName: "Monday" },
    { open: "08:00", close: "16:00", dayName: "Tuesday" },
    { open: "08:00", close: "16:00", dayName: "Wednesday" },
    { open: "08:00", close: "16:00", dayName: "Thursday" },
    { open: "08:00", close: "16:00", dayName: "Friday" },
    { open: "closed", close: "closed", dayName: "Saturday" },
    { open: "closed", close: "closed", dayName: "Sunday" }
  ];

  useEffect(() => {
    if (!practice?.practice_id) return;
    const { start_time, end_time } = computeTimeRange(currentDate, view);
    fetch(
      `/api/appointment?practiceId=${practice.practice_id}&start_time=${encodeURIComponent(
        start_time
      )}&end_time=${encodeURIComponent(end_time)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Error fetching appointments:", data.error);
        } else {
          console.log('Appointment data', data);
          setAppointments(data.appointments);
        }
      })
      .catch((err) => {
        console.error("Error fetching appointments:", err);
      });
  }, [view, currentDate, practice?.practice_id]);

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

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleSlotClick = (start: Date, end: Date) => {
    setCreateDefaults({ start, end });
    setShowCreatePopup(true);
  };

  const handleAppointmentCreated = (newAppointment: Appointment) => {
    // Optionally, you might choose to refetch appointments here.
    setAppointments((prev) => [...prev, newAppointment]);
  };

  if (userLoading || practiceLoading) return <div>Loading...</div>;
  if (!user || user.role !== "verified-practice") {
    return <div>Access Denied: You are not authorized to view this page.</div>;
  }

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
        <button
          onClick={() => {
            setCreateDefaults({
              start: new Date(),
              end: new Date(new Date().getTime() + 30 * 60000),
            });
            setShowCreatePopup(true);
          }}
          className={styles.createButton}
        >
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
