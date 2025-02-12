import React from "react";
import styles from "./AppointmentCalendar.module.css";

export type ViewType = "day" | "calendarWeek" | "workWeek" | "month";

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

interface AppointmentCalendarProps {
  view: ViewType;
  currentDate: Date;
  appointments: Appointment[];
  openingHours: OpeningHoursItem[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onSlotClick?: (start: Date, end: Date) => void;
}

const CALENDAR_START_HOUR = 6; // 6:00 AM
const CALENDAR_END_HOUR = 22;  // 10:00 PM
const SLOT_DURATION = 30;      // minutes
const TOTAL_MINUTES = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60; // e.g., 16 hours * 60 = 960 minutes
const NUM_SLOTS = TOTAL_MINUTES / SLOT_DURATION; // e.g., 32 slots

// Helper: Convert "HH:MM" to minutes since midnight (or null for "closed")
const timeStringToMinutes = (timeStr: string): number | null => {
  if (timeStr.toLowerCase() === "closed") return null;
  const parts = timeStr.split(":");
  if (parts.length !== 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
};

// Compute positioned appointments (for one day) relative to CALENDAR_START_HOUR
interface PositionedAppointment extends Appointment {
  top: number;
  height: number;
  left: number;
  width: number;
  startMinutes: number;
  endMinutes: number;
}
const computePositionedAppointments = (appointments: Appointment[]): PositionedAppointment[] => {
  let positioned: PositionedAppointment[] = appointments.map((appt) => {
    const startDate = new Date(appt.start);
    const endDate = new Date(appt.end);
    let startMinutes = (startDate.getHours() * 60 + startDate.getMinutes()) - CALENDAR_START_HOUR * 60;
    let endMinutes = (endDate.getHours() * 60 + endDate.getMinutes()) - CALENDAR_START_HOUR * 60;
    startMinutes = Math.max(0, startMinutes);
    endMinutes = Math.min(TOTAL_MINUTES, endMinutes);
    return {
      ...appt,
      startMinutes,
      endMinutes,
      top: (startMinutes / TOTAL_MINUTES) * 100,
      height: ((endMinutes - startMinutes) / TOTAL_MINUTES) * 100,
      left: 0,
      width: 100,
    };
  });
  positioned.sort((a, b) => a.startMinutes - b.startMinutes);
  // Group overlapping appointments into clusters
  let clusters: PositionedAppointment[][] = [];
  positioned.forEach((appt) => {
    let placed = false;
    for (const cluster of clusters) {
      const clusterEnd = Math.max(...cluster.map(a => a.endMinutes));
      if (appt.startMinutes >= clusterEnd) {
        cluster.push(appt);
        placed = true;
        break;
      }
    }
    if (!placed) {
      clusters.push([appt]);
    }
  });
  clusters.forEach(cluster => {
    const count = cluster.length;
    cluster.forEach((appt, index) => {
      appt.left = (index / count) * 100;
      appt.width = 100 / count;
    });
  });
  return positioned;
};

// Helper: Return Monday (start of week) for a given date
const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  view,
  currentDate,
  appointments,
  openingHours,
  onAppointmentClick,
  onSlotClick,
}) => {
  // Determine which days to display based on the view
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
    // For a simple month view, compute a grid of days covering the month.
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    // Start from the Sunday before (or equal to) the first day of month
    const start = new Date(firstDayOfMonth);
    start.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
    // End on the Saturday after (or equal to) the last day of month
    const end = new Date(lastDayOfMonth);
    end.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));
    let d = new Date(start);
    while (d <= end) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
  }

  // --- Render for time–grid views (day, calendarWeek, workWeek) ---
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
            // Get the opening hours for this day (if any)
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
            // Filter appointments that occur on this day
            const dayAppointments = appointments.filter(appt => {
              const apptDate = new Date(appt.start);
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
                    // Compute actual slot start and end Date objects
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
                        {/*
                          Render the open–hour indicator.
                          Color scheme:
                          - Closed hours (the base slot background): #a0a0a0
                          - Open hours (the overlay): #d0d0d0
                          
                          Alternative options (uncomment one if you’d like to try):
                          
                          // Option 2:
                          // In CSS:
                          // .timeSlot { background-color: #9e9e9e; }
                          // .openIndicator { background-color: #eeeeee; }
                          // .timeSlot:hover .openIndicator { background-color: #e0e0e0; }
                          
                          // Option 3:
                          // .timeSlot { background-color: #757575; }
                          // .openIndicator { background-color: #bdbdbd; }
                          // .timeSlot:hover .openIndicator { background-color: #a8a8a8; }
                        */}
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
                  {positionedAppointments.map(appt => (
                    <div
                      key={appt.id}
                      className={styles.appointmentBlock}
                      style={{
                        top: `${appt.top}%`,
                        height: `${appt.height}%`,
                        left: `${appt.left}%`,
                        width: `${appt.width}%`,
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
  // --- Render for Month View ---
  else if (view === "month") {
    // Compute a simple month grid
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    // Start from the Sunday before (or equal to) the first day of the month
    const start = new Date(firstDayOfMonth);
    start.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
    // End on the Saturday after (or equal to) the last day of the month
    const end = new Date(lastDayOfMonth);
    end.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));
    const weeks: Date[][] = [];
    let week: Date[] = [];
    let d = new Date(start);
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
                {/* Optionally, add a summary of appointments for this day */}
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
