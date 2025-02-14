// components/practice/CreateAppointmentPopup/CreateAppointmentPopup.tsx
import React, { useState } from 'react';
import styles from './CreateAppointmentPopup.module.css';
import { OpeningHoursItem, Appointment } from '@/types/practice';

interface CreateAppointmentPopupProps {
  practiceId: string;
  openingHours: OpeningHoursItem[];
  defaultStart: Date;
  defaultEnd: Date;
  onClose: () => void;
  onCreated: (appointment: Appointment) => void;
}

const CreateAppointmentPopup: React.FC<CreateAppointmentPopupProps> = ({
  practiceId,
  openingHours,
  defaultStart,
  defaultEnd,
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  // Format dates to "YYYY-MM-DDTHH:MM"
  const [start, setStart] = useState(defaultStart.toISOString().slice(0, 16));
  const [end, setEnd] = useState(defaultEnd.toISOString().slice(0, 16));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate that the appointment is within opening hours.
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dayName = startDate.toLocaleDateString("en-US", { weekday: "long" });
    const dayOpening = openingHours.find(oh => oh.dayName === dayName);
    if (!dayOpening || dayOpening.open.toLowerCase() === 'closed' || dayOpening.close.toLowerCase() === 'closed') {
      setError(`The practice is closed on ${dayName}`);
      return;
    }
    // Build Date objects for the opening and closing times on the same day.
    const [openHour, openMinute] = dayOpening.open.split(':').map(Number);
    const [closeHour, closeMinute] = dayOpening.close.split(':').map(Number);
    const openDate = new Date(startDate);
    openDate.setHours(openHour, openMinute, 0, 0);
    const closeDate = new Date(startDate);
    closeDate.setHours(closeHour, closeMinute, 0, 0);
    if (startDate < openDate || endDate > closeDate) {
      setError(`Appointment must be within opening hours: ${dayOpening.open} - ${dayOpening.close}`);
      return;
    }
    try {
      const response = await fetch('/api/appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          practice_id: practiceId,
          title,
          start_time: start,
          end_time: end
        })
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Error creating appointment");
      }
      onCreated(result.appointment);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error creating appointment";
      setError(message);
    }
  };

  return (
    <div className={styles.popupOverlay} onClick={(e) => {
      if ((e.target as HTMLElement).classList.contains(styles.popupOverlay)) {
        onClose();
      }
    }}>
      <div className={styles.popupContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>Create Appointment</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Title:
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            Start:
            <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
          </label>
          <label>
            End:
            <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required />
          </label>
          <button type="submit" className={styles.saveButton}>Create</button>
        </form>
      </div>
    </div>
  );
};

export default CreateAppointmentPopup;
