// components/practice/AppointmentCalendar/AppointmentCalendar.tsx
import React from "react";
import styles from "./AppointmentCalendar.module.css";
import { Appointment, OpeningHoursItem, ViewType } from "../../../types/practice";
import { CALENDAR_START_HOUR, SLOT_DURATION, NUM_SLOTS, TOTAL_MINUTES } from "../../../constants/calendarConstants";
import { timeStringToMinutes, getMonday, computePositionedAppointments } from "../../../lib/utils/calendar";

interface AppointmentCalendarProps {
  view: ViewType;
  currentDate: Date;
  appointments: Appointment[];
  openingHours: OpeningHoursItem[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onSlotClick?: (start: Date, end: Date) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  view,
  currentDate,
  appointments,
  openingHours,
  onAppointmentClick,
  onSlotClick,
}) => {
  // Determine the days to display based on view
  let days: Date[] = [];
  if (view === "day") {
    days = [new Date(currentDate)];
  } else if (view === "calendarWeek") {
    const monday = getMonday(currentDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
  } else if (view === "workWeek") {
    const monday = getMonday(currentDate);
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
  } else if (view === "month") {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const start = new Date(firstDayOfMonth);
    start.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
    const end = new Date(lastDayOfMonth);
    end.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));
    const d = new Date(start);
    while (d <= end) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
  }

  // Render time‑grid views (day, calendarWeek, workWeek)
  if (view === "day" || view === "calendarWeek" || view === "workWeek") {
    return (
      <div className={styles.calendarContainer}>
        <div className={styles.headerRow}>
          <div className={styles.timeColumn}></div>
          {days.map((day) => (
            <div key={day.toDateString()} className={styles.dayHeader}>
              {day.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </div>
          ))}
        </div>
        <div className={styles.body}>
          <div className={styles.timeColumn}>
            {Array.from({ length: NUM_SLOTS }).map((_, slotIndex) => {
              const totalMinutes = CALENDAR_START_HOUR * 60 + slotIndex * SLOT_DURATION;
              const hour = Math.floor(totalMinutes / 60);
              const minute = totalMinutes % 60;
              const label = `${hour.toString().padStart(2, "0")}:${minute === 0 ? "00" : minute}`;
              return (
                <div key={slotIndex} className={styles.timeLabel}>
                  {label}
                </div>
              );
            })}
          </div>
          {days.map((day) => {
            const dayName = day.toLocaleDateString("en-US", { weekday: "long" });
            const dayOpening = openingHours.find(oh => oh.dayName === dayName);
            let openMinutes: number | null = null;
            let closeMinutes: number | null = null;
            if (dayOpening) {
              const openAbs = timeStringToMinutes(dayOpening.open);
              const closeAbs = timeStringToMinutes(dayOpening.close);
              if (openAbs !== null && closeAbs !== null) {
                openMinutes = Math.max(0, openAbs - CALENDAR_START_HOUR * 60);
                closeMinutes = Math.min(TOTAL_MINUTES, closeAbs - CALENDAR_START_HOUR * 60);
              }
            }
            const dayAppointments = appointments.filter(appt => {
              const apptDate = new Date(appt.start_time);
              return apptDate.toDateString() === day.toDateString();
            });
            const positionedAppointments = computePositionedAppointments(dayAppointments);
            return (
              <div key={day.toDateString()} className={styles.dayColumn}>
                <div className={styles.dayGrid}>
                  {Array.from({ length: NUM_SLOTS }).map((_, slotIndex) => {
                    const slotStartMinutes = slotIndex * SLOT_DURATION;
                    const slotEndMinutes = slotStartMinutes + SLOT_DURATION;
                    let openFraction = 0;
                    let openOffset = 0;
                    if (openMinutes !== null && closeMinutes !== null) {
                      const overlapStart = Math.max(slotStartMinutes, openMinutes);
                      const overlapEnd = Math.min(slotEndMinutes, closeMinutes);
                      const overlap = Math.max(0, overlapEnd - overlapStart);
                      openFraction = overlap / SLOT_DURATION;
                      openOffset = ((overlapStart - slotStartMinutes) / SLOT_DURATION) * 100;
                    }
                    const slotStart = new Date(day);
                    slotStart.setHours(CALENDAR_START_HOUR, slotIndex * SLOT_DURATION, 0, 0);
                    const slotEnd = new Date(slotStart);
                    slotEnd.setMinutes(slotStart.getMinutes() + SLOT_DURATION);
                    return (
                      <div
                        key={slotIndex}
                        className={styles.timeSlot}
                        onClick={() => {
                          if (onSlotClick) onSlotClick(slotStart, slotEnd);
                        }}
                      >
                        {openFraction > 0 && (
                          <div
                            className={styles.openIndicator}
                            style={{
                              top: `${openOffset}%`,
                              height: `${openFraction * 100}%`,
                            }}
                          ></div>
                        )}
                      </div>
                    );
                  })}
                  {positionedAppointments.map((appt) => (
                    <div
                      key={appt.appointment_id}
                      className={styles.appointmentBlock}
                      style={{
                        top: `${appt.top}%`,
                        height: `${appt.height}%`,
                        left: `${appt.left}%`,
                        width: `${appt.width}%`,
                        backgroundColor: appt.booked
                          ? "rgba(244,67,54,0.8)"
                          : "rgba(76,175,80,0.8)",
                      }}
                      onClick={() => {
                        if (onAppointmentClick) onAppointmentClick(appt);
                      }}
                    >
                      {appt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  // Render a simple month grid for month view
  else if (view === "month") {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const start = new Date(firstDayOfMonth);
    start.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
    const end = new Date(lastDayOfMonth);
    end.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));
    const weeks: Date[][] = [];
    let week: Date[] = [];
    const d = new Date(start);
    while (d <= end) {
      week.push(new Date(d));
      if (d.getDay() === 6) {
        weeks.push(week);
        week = [];
      }
      d.setDate(d.getDate() + 1);
    }
    return (
      <div className={styles.monthContainer}>
        {weeks.map((week, index) => (
          <div key={index} className={styles.weekRow}>
            {week.map((day, idx) => (
              <div key={idx} className={styles.monthDay}>
                <div className={styles.monthDayHeader}>{day.getDate()}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default AppointmentCalendar;
