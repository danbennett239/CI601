// components/practice/AppointmentPopup/AppointmentPopup.tsx
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import styles from './AppointmentPopup.module.css';
import { Appointment, OpeningHoursItem } from '../../../types/practice';
import ConfirmDeletePopup from '../ConfirmDeletePopup/ConfirmDeletePopup';

const editSchema = z.object({
  title: z.string().min(1, "Title is required"),
  start_time: z.string(), // datetime-local string (YYYY-MM-DDTHH:MM)
  end_time: z.string(),
}).refine(data => {
  const startDate = new Date(data.start_time);
  const endDate = new Date(data.end_time);
  return endDate > startDate;
}, { message: "End time must be after start time" });

interface AppointmentPopupProps {
  appointment: Appointment;
  openingHours: OpeningHoursItem[];
  onClose: () => void;
  onUpdated: (updatedAppointment: Appointment) => void;
  onDeleted: () => void;
}

const AppointmentPopup: React.FC<AppointmentPopupProps> = ({
  appointment,
  openingHours,
  onClose,
  onUpdated,
  onDeleted,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formTitle, setFormTitle] = useState(appointment.title);
  const [formStart, setFormStart] = useState(appointment.start_time.slice(0, 16));
  const [formEnd, setFormEnd] = useState(appointment.end_time.slice(0, 16));
  const [error, setError] = useState<string>('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Compute the original duration in milliseconds.
  const originalDuration = new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime();

  // If the appointment is booked and user_id is non-null, fetch user info.
  useEffect(() => {
    if (appointment.booked && appointment.user_id) {
      fetch(`/api/users?userId=${appointment.user_id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error('Error fetching user info:', data.error);
          } else {
            setUserInfo(data.user);
          }
        })
        .catch((err) => console.error('Error fetching user info:', err));
    }
  }, [appointment]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.popupOverlay)) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Validate that the new times fall within the practice’s opening hours.
  const validateWithinOpeningHours = (startISO: string, endISO: string): boolean => {
    const startDate = new Date(startISO);
    const dayName = startDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayOpening = openingHours.find((oh) => oh.dayName === dayName);
    if (!dayOpening || dayOpening.open.toLowerCase() === 'closed' || dayOpening.close.toLowerCase() === 'closed') {
      setError(`The practice is closed on ${dayName}`);
      return false;
    }
    const [openHour, openMinute] = dayOpening.open.split(':').map(Number);
    const [closeHour, closeMinute] = dayOpening.close.split(':').map(Number);
    const openDate = new Date(startDate);
    openDate.setHours(openHour, openMinute, 0, 0);
    const closeDate = new Date(startDate);
    closeDate.setHours(closeHour, closeMinute, 0, 0);
    if (startDate < openDate || new Date(endISO) > closeDate) {
      setError(`Appointment must be within opening hours: ${dayOpening.open} - ${dayOpening.close}`);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError('');
    const parseResult = editSchema.safeParse({
      title: formTitle,
      start_time: formStart,
      end_time: formEnd,
    });
    if (!parseResult.success) {
      setError(parseResult.error.errors.map(err => err.message).join(', '));
      return;
    }
    if (!validateWithinOpeningHours(formStart, formEnd)) return;
    try {
      const response = await fetch(`/api/appointment/${appointment.appointment_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          start_time: formStart,
          end_time: formEnd,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        setError(result.error || 'Error updating appointment');
      } else {
        onUpdated(result.appointment);
        setEditMode(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating appointment');
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/appointment/${appointment.appointment_id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        setError(result.error || 'Error deleting appointment');
      } else {
        onDeleted();
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error deleting appointment');
    }
  };

  // When the start field changes, adjust the end field to preserve the original duration.
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setFormStart(newStart);
    const newStartDate = new Date(newStart);
    const newEndDate = new Date(newStartDate.getTime() + originalDuration);
    setFormEnd(newEndDate.toISOString().slice(0, 16));
  };

  return (
    <div className={styles.popupOverlay} onClick={handleOverlayClick}>
      <div className={styles.popupContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        {!editMode ? (
          <>
            <h2>Appointment Details</h2>
            <div className={styles.detailsForm}>
              <div className={styles.detailRow}>
                <label>Title:</label>
                <span>{appointment.title}</span>
              </div>
              <div className={styles.detailRow}>
                <label>Start:</label>
                <span>{new Date(appointment.start_time).toLocaleString()}</span>
              </div>
              <div className={styles.detailRow}>
                <label>End:</label>
                <span>{new Date(appointment.end_time).toLocaleString()}</span>
              </div>
              <div className={styles.detailRow}>
                <label>Status:</label>
                <span>{appointment.booked ? 'Booked' : 'Available'}</span>
              </div>
            </div>
            <div className={styles.buttonRow}>
              {!appointment.booked && (
                <button className={styles.editButton} onClick={() => setEditMode(true)}>
                  Edit
                </button>
              )}
              <button className={styles.deleteButton} onClick={handleDelete}>
                Delete
              </button>
            </div>
            {appointment.booked && (
              <div className={styles.userInfoContainer}>
                <div className={styles.divider} />
                <div className={styles.userInfo}>
                  {appointment.user_id ? (
                    userInfo ? (
                      <>
                        <p>
                          <strong>User:</strong> {userInfo.first_name} {userInfo.last_name}
                        </p>
                        <p>
                          <strong>Phone:</strong> {userInfo.phone_number}
                        </p>
                        <p>
                          <strong>Email:</strong> {userInfo.email}
                        </p>
                      </>
                    ) : (
                      <p>Loading user info...</p>
                    )
                  ) : (
                    <p>Appointment was manually booked.</p>
                  )}
                </div>
              </div>
            )}
            {error && <p className={styles.error}>{error}</p>}
          </>
        ) : (
          <>
            <h2>Edit Appointment</h2>
            <div className={styles.editForm}>
              <label>Title:</label>
              <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
              <label>Start:</label>
              <input type="datetime-local" value={formStart} onChange={handleStartChange} />
              <label>End:</label>
              <input type="datetime-local" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.buttonRow}>
              <button className={styles.saveButton} onClick={handleSave}>Save</button>
              <button className={styles.cancelButton} onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </>
        )}
      </div>
      {showDeleteConfirm && (
        <ConfirmDeletePopup
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          onDontShowAgain={(dontShow) => {
            // Update preferences via API/service and/or store locally.
            // Here we update localStorage and you can later call your preferences API.
            localStorage.setItem('hideDeleteConfirmation', dontShow ? 'true' : 'false');
          }}
        />
      )}
    </div>
  );
};

export default AppointmentPopup;
