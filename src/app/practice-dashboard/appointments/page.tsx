// app/practice-dashboard/appointments/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  // Remove the trailing "Z" so that our backend accepts the format (if needed)
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

  // New state for the booked filter dropdown.
  const [bookedFilter, setBookedFilter] = useState<string>("all");

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
    // Build the URL and include the booked parameter if not "all"
    let url = `/api/appointment?practiceId=${practice.practice_id}&start_time=${encodeURIComponent(
      start_time
    )}&end_time=${encodeURIComponent(end_time)}`;
    if (bookedFilter !== "all") {
      const bookedParam = bookedFilter === "booked" ? "true" : "false";
      url += `&booked=${bookedParam}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Error fetching appointments:", data.error);
        } else {
          console.log("Appointment data", data);
          setAppointments(data.appointments);
        }
      })
      .catch((err) => {
        console.error("Error fetching appointments:", err);
      });
  }, [view, currentDate, practice?.practice_id, bookedFilter]);

  useEffect(() => {
    localStorage.setItem("appointmentView", view);
  }, [view]);

  const handleViewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setView(e.target.value as ViewType);
  };

  const handleBookedFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBookedFilter(e.target.value);
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

  // When clicking an empty slot in the calendar, check if the time is within opening hours.
  const handleSlotClick = (start: Date, end: Date) => {
    const dayName = start.toLocaleDateString("en-US", { weekday: "long" });
    const dayOpening = openingHours.find((oh) => oh.dayName === dayName);
    if (!dayOpening || dayOpening.open.toLowerCase() === "closed" || dayOpening.close.toLowerCase() === "closed") {
      toast.error(`Appointments cannot be created on ${dayName} as the practice is closed.`);
      return;
    }
    const [openHour, openMinute] = dayOpening.open.split(":").map(Number);
    const [closeHour, closeMinute] = dayOpening.close.split(":").map(Number);
    const openDate = new Date(start);
    openDate.setHours(openHour, openMinute, 0, 0);
    const closeDate = new Date(start);
    closeDate.setHours(closeHour, closeMinute, 0, 0);
    if (start < openDate || end > closeDate) {
      toast.error(`Appointments must be within opening hours: ${dayOpening.open} - ${dayOpening.close}`);
      return;
    }
    setCreateDefaults({ start, end });
    setShowCreatePopup(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleAppointmentCreated = (newAppointment: Appointment) => {
    // Optionally, you might refetch appointments instead.
    setAppointments((prev) => [...prev, newAppointment]);
  };

  if (userLoading || practiceLoading) return <div>Loading...</div>;
  if (!user || user.role !== "verified-practice") {
    return <div>Access Denied: You are not authorized to view this page.</div>;
  }

  return (
    <div className={styles.appointmentsPage}>
      <ToastContainer />
      <Link href="/practice-dashboard" className={styles.backButton}>
        Back to Practice Dashboard
      </Link>
      <h1>Manage Appointments</h1>
      <div className={styles.controls}>
        <div className={styles.leftControls}>
          <select value={view} onChange={handleViewChange} className={styles.dropdown}>
            <option value="day">Day</option>
            <option value="calendarWeek">Calendar Week (Mon–Sun)</option>
            <option value="workWeek">Work Week (Mon–Fri)</option>
            <option value="month">Month</option>
          </select>
          <select value={bookedFilter} onChange={handleBookedFilterChange} className={styles.dropdown}>
            <option value="all">All Appointments</option>
            <option value="booked">Booked Appointments</option>
            <option value="unbooked">Unbooked Appointments</option>
          </select>
          <button onClick={goToPrevious} className={styles.navButton}>
            Previous
          </button>
          <button onClick={goToNext} className={styles.navButton}>
            Next
          </button>
        </div>
        <div className={styles.rightControls}>
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
