"use client";

import React, { useMemo } from "react";
import styles from "./AppointmentsLineChart.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Appointment {
  appointment_id: string;
  start_time: string;
}

interface AppointmentsLineChartProps {
  appointments: Appointment[];
}

function generateDateRange(startDate: string, endDate: string): string[] {
  const dateArray: string[] = [];
  // `let` is required because we modify `currentDate` in the loop
  // eslint-disable-next-line prefer-const
  let currentDate = new Date(startDate);
  const stopDate = new Date(endDate);

  while (currentDate <= stopDate) {
    dateArray.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dateArray;
}

/**
 * Filters the date labels to avoid overcrowding the x-axis.
 * - Shows every 2nd or 3rd day if too many dates exist.
 */
function filterDateLabels(labels: string[]): string[] {
  if (labels.length > 20) {
    return labels.filter((_, index) => index % 3 === 0);
  } else if (labels.length > 10) {
    return labels.filter((_, index) => index % 2 === 0);
  }
  return labels;
}

export default function AppointmentsLineChart({ appointments }: AppointmentsLineChartProps) {
  // Get the min and max date range from the appointment dataset
  const startDate = appointments.length
    ? appointments.reduce((min, apt) => (apt.start_time < min ? apt.start_time : min), appointments[0].start_time)
    : new Date().toISOString().split("T")[0];

  const endDate = new Date().toISOString().split("T")[0]; // Always use today as the latest

  const fullDateLabels = useMemo(() => generateDateRange(startDate, endDate), [startDate, endDate]);

  const dateLabels = useMemo(() => filterDateLabels(fullDateLabels), [fullDateLabels]);

  const appointmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    fullDateLabels.forEach((date) => (counts[date] = 0));

    appointments.forEach((apt) => {
      const date = apt.start_time.split("T")[0];
      if (counts[date] !== undefined) {
        counts[date]++;
      }
    });

    return fullDateLabels.map((date) => counts[date]);
  }, [appointments, fullDateLabels]);

  const data = {
    labels: dateLabels,
    datasets: [
      {
        label: "Appointments",
        data: appointmentCounts.filter((_, index) => dateLabels.includes(fullDateLabels[index])),
        fill: false,
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.3)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Appointments",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
        ticks: {
          autoSkip: false,
        },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>Appointments Over Time</h3>
      <div className={styles.chartWrapper}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
