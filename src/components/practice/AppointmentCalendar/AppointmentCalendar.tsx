// components/AppointmentCalendar.tsx
import React from "react";
import styles from "./AppointmentCalendar.module.css";

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
  timeframe: "today" | "week" | "month";
  appointments: Appointment[];
  openingHours: OpeningHoursItem[];
}

const CALENDAR_START_HOUR = 6; // calendar starts at 6:00 AM
const CALENDAR_END_HOUR = 22;  // calendar ends at 10:00 PM
const SLOT_DURATION = 30;      // each slot represents 30 minutes
const TOTAL_MINUTES = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60; // 16 hours = 960 minutes
const NUM_SLOTS = TOTAL_MINUTES / SLOT_DURATION; // 960/30 = 32

// Convert a time string (HH:MM) to minutes since midnight; returns null for "closed"
const timeStringToMinutes = (timeStr: string): number | null => {
  if (timeStr.toLowerCase() === "closed") return null;
  const parts = timeStr.split(":");
  if (parts.length !== 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
};

// Get day name (e.g., "Monday") from a Date
const getDayName = (date: Date): string => {
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

// Return minutes offset (from CALENDAR_START_HOUR) for a Date on that day
const getMinutesOffset = (date: Date): number => {
  const totalMinutesFromMidnight = date.getHours() * 60 + date.getMinutes();
  return totalMinutesFromMidnight - CALENDAR_START_HOUR * 60;
};

interface PositionedAppointment extends Appointment {
  top: number;       // in percentage relative to the day column’s height
  height: number;    // in percentage based on appointment duration
  left: number;      // in percentage (for overlapping appointments)
  width: number;     // in percentage (for overlapping appointments)
  startMinutes: number;
  endMinutes: number;
}

// Compute each appointment’s top, height, left, and width values (handling overlaps)
const computePositionedAppointments = (appointments: Appointment[]): PositionedAppointment[] => {
  // Map appointments to include start and end minutes (relative to CALENDAR_START_HOUR)
  let positioned: PositionedAppointment[] = appointments.map((appt) => {
    const startDate = new Date(appt.start);
    const endDate = new Date(appt.end);
    let startMinutes = getMinutesOffset(startDate);
    let endMinutes = getMinutesOffset(endDate);
    // Clamp to calendar boundaries
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

  // Sort appointments by start time
  positioned.sort((a, b) => a.startMinutes - b.startMinutes);

  // Group overlapping appointments into clusters and assign left/width
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

  // Within each cluster, each appointment gets a share of the horizontal space
  clusters.forEach(cluster => {
    const count = cluster.length;
    cluster.forEach((appt, index) => {
      appt.left = (index / count) * 100;
      appt.width = 100 / count;
    });
  });

  return positioned;
};

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  timeframe,
  appointments,
  openingHours,
}) => {
  if (timeframe !== "week") {
    return <div>Currently, only the week view is implemented.</div>;
  }

  // Define the week days in order (Monday to Sunday)
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Group appointments by day (using the start date’s day name)
  const appointmentsByDay: { [day: string]: Appointment[] } = {};
  weekDays.forEach(day => (appointmentsByDay[day] = []));
  appointments.forEach(appt => {
    const date = new Date(appt.start);
    const dayName = getDayName(date);
    if (appointmentsByDay[dayName]) {
      appointmentsByDay[dayName].push(appt);
    }
  });

  return (
    <div className={styles.calendarContainer}>
      {/* Header row: empty left column for time labels then day headers */}
      <div className={styles.headerRow}>
        <div className={styles.timeColumn}></div>
        {weekDays.map(day => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}
      </div>
      <div className={styles.body}>
        {/* Time label column */}
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
        {/* Each day column */}
        {weekDays.map(day => {
          // Get opening hours for the day (if any)
          const dayOpening = openingHours.find(oh => oh.dayName === day);
          let openMinutes: number | null = null;
          let closeMinutes: number | null = null;
          if (dayOpening) {
            const openAbs = timeStringToMinutes(dayOpening.open);
            const closeAbs = timeStringToMinutes(dayOpening.close);
            if (openAbs !== null && closeAbs !== null) {
              // Convert to minutes relative to CALENDAR_START_HOUR
              openMinutes = Math.max(0, openAbs - CALENDAR_START_HOUR * 60);
              closeMinutes = Math.min(TOTAL_MINUTES, closeAbs - CALENDAR_START_HOUR * 60);
            }
          }

          // Get and process appointments for this day
          const dayAppointments = appointmentsByDay[day] || [];
          const positionedAppointments = computePositionedAppointments(dayAppointments);

          return (
            <div key={day} className={styles.dayColumn}>
              <div className={styles.dayGrid}>
                {Array.from({ length: NUM_SLOTS }).map((_, slotIndex) => {
                  const slotStart = slotIndex * SLOT_DURATION;
                  const slotEnd = slotStart + SLOT_DURATION;
                  // Determine if (and how much of) this slot falls within the opening hours.
                  let openFraction = 0;
                  let openOffset = 0;
                  if (openMinutes !== null && closeMinutes !== null) {
                    const overlapStart = Math.max(slotStart, openMinutes);
                    const overlapEnd = Math.min(slotEnd, closeMinutes);
                    const overlap = Math.max(0, overlapEnd - overlapStart);
                    openFraction = overlap / SLOT_DURATION;
                    openOffset = ((overlapStart - slotStart) / SLOT_DURATION) * 100;
                  }
                  return (
                    <div
                      key={slotIndex}
                      className={styles.timeSlot}
                      onDoubleClick={() => {
                        // When the user double-clicks on this slot, log its time values.
                        const slotTimeInMinutes = CALENDAR_START_HOUR * 60 + slotIndex * SLOT_DURATION;
                        const hour = Math.floor(slotTimeInMinutes / 60);
                        const minute = slotTimeInMinutes % 60;
                        console.log(`Double clicked on ${day} at ${hour}:${minute < 10 ? "0" : ""}${minute}`);
                        // In the future, pass these values to an appointment creation form.
                      }}
                    >
                      {/* Render an indicator for open hours (it may cover a fraction of the slot) */}
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
                {/* Overlay appointment blocks */}
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
                      console.log("Clicked appointment:", appt);
                      // In the future, use this data to view/edit the appointment.
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
};

export default AppointmentCalendar;
