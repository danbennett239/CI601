// lib/utils/calendar.ts
// import { CALENDAR_START_HOUR, SLOT_DURATION, TOTAL_MINUTES } from "../../constants/calendarConstants";
import { CALENDAR_START_HOUR, SLOT_DURATION, TOTAL_MINUTES } from "../../constants/calendarConstants";
import { Appointment } from "../../types/practice";

/**  
 * Represents an appointment with calculated positioning values for display.
 */
export interface PositionedAppointment extends Appointment {
  top: number;
  height: number;
  left: number;
  width: number;
  startMinutes: number;
  endMinutes: number;
}

/**
 * Converts a time string (e.g., "08:15") to minutes since midnight.
 * Returns null for "closed".
 */
export const timeStringToMinutes = (timeStr: string): number | null => {
  if (timeStr.toLowerCase() === "closed") return null;
  const parts = timeStr.split(":");
  if (parts.length !== 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
};

/** Returns the Monday of the week for a given date. */
export const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Computes the vertical positioning (top, height) and horizontal placement (left, width)
 * for each appointment so that overlapping appointments are split equally.
 */
export const computePositionedAppointments = (appointments: Appointment[]): PositionedAppointment[] => {
  // Map appointments into our PositionedAppointment interface.
  const positioned: PositionedAppointment[] = appointments.map((appt) => {
    const startDate = new Date(appt.start_time);
    const endDate = new Date(appt.end_time);
    let startMinutes = (startDate.getHours() * 60 + startDate.getMinutes()) - CALENDAR_START_HOUR * 60;
    let endMinutes = (endDate.getHours() * 60 + endDate.getMinutes()) - CALENDAR_START_HOUR * 60;
    startMinutes = Math.max(0, startMinutes);
    endMinutes = Math.min(TOTAL_MINUTES, endMinutes);
    return {
      ...appt, // includes appointment_id, title, start_time, end_time, etc.
      startMinutes,
      endMinutes,
      top: (startMinutes / TOTAL_MINUTES) * 100,
      height: ((endMinutes - startMinutes) / TOTAL_MINUTES) * 100,
      left: 0,
      width: 100,
    };
  });

  // Group appointments into clusters where appointments in the same cluster overlap.
  const clusters: PositionedAppointment[][] = [];
  for (const appt of positioned) {
    let placedInCluster = false;
    for (const cluster of clusters) {
      // If any appointment in the cluster overlaps with the current one, add it to that cluster.
      if (cluster.some(a => !(appt.startMinutes >= a.endMinutes || appt.endMinutes <= a.startMinutes))) {
        cluster.push(appt);
        placedInCluster = true;
        break;
      }
    }
    if (!placedInCluster) {
      clusters.push([appt]);
    }
  }

  // For each cluster, assign columns so that overlapping appointments split the width.
  clusters.forEach(cluster => {
    // Sort the cluster by start time.
    cluster.sort((a, b) => a.startMinutes - b.startMinutes);
    const columns: PositionedAppointment[][] = [];
    cluster.forEach(appt => {
      let placed = false;
      // Try to place the appointment in an existing column.
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        if (appt.startMinutes >= col[col.length - 1].endMinutes) {
          col.push(appt);
          placed = true;
          break;
        }
      }
      // Otherwise, start a new column.
      if (!placed) {
        columns.push([appt]);
      }
    });
    const numColumns = columns.length;
    // For every appointment in this cluster, set its left position and width.
    columns.forEach((col, colIndex) => {
      col.forEach(appt => {
        appt.left = (colIndex / numColumns) * 100;
        appt.width = 100 / numColumns;
      });
    });
  });

  return positioned;
};
