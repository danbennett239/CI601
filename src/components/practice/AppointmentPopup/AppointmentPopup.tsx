import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import styles from './AppointmentPopup.module.css';
import { Appointment, OpeningHoursItem } from '@/types/practice'; // Adjust import paths
import ConfirmDeletePopup from '../ConfirmDeletePopup/ConfirmDeletePopup';

const editSchema = z.object({
  title: z.string().min(1, "Title is required"),
  start_time: z.string(),
  end_time: z.string(),
}).refine(data => new Date(data.end_time) > new Date(data.start_time), {
  message: "End time must be after start time",
});

interface AppointmentPopupProps {
  appointment: Appointment;
  openingHours: OpeningHoursItem[];
  hideDeleteConfirmation: boolean;  // <<--- New prop
  onClose: () => void;
  onUpdate: (updateData: Partial<Appointment>) => Promise<void>;
  onDelete: (appointmentId: string) => Promise<void>;
  onDontShowAgain: (dontShow: boolean) => void;  // <<--- New prop
}

const AppointmentPopup: React.FC<AppointmentPopupProps> = ({
  appointment,
  openingHours,
  hideDeleteConfirmation,
  onClose,
  onUpdate,
  onDelete,
  onDontShowAgain,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formTitle, setFormTitle] = useState(appointment.title);
  const [formStart, setFormStart] = useState(appointment.start_time.slice(0, 16));
  const [formEnd, setFormEnd] = useState(appointment.end_time.slice(0, 16));
  const [error, setError] = useState<string>('');
  const [userInfo, setUserInfo] = useState<Record<string, string> | null>(null);

  // For the "Delete" confirmation popup
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate original duration for start/end sync
  const originalDuration =
    new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime();

  // If appointment is booked, fetch user info
  useEffect(() => {
    if (appointment.booked && appointment.user_id) {
      fetch(`/api/user/${appointment.user_id}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setUserInfo(data.user);
          }
        })
        .catch((err) => console.error('Error fetching user info:', err));
    }
  }, [appointment]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.popupOverlay)) {
      onClose();
    }
  };

  // Validate within opening hours
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

  // Handle edits
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
      await onUpdate({
        title: formTitle,
        start_time: formStart,
        end_time: formEnd,
      });
      setEditMode(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error updating appointment';
      setError(message);
    }
  };

  const handleMarkBooked = async () => {
    setError('');
    try {
      await onUpdate({ booked: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error marking appointment as booked';
      setError(message);
    }
  };

  // Check preference before showing the ConfirmDeletePopup
  const handleDeleteClick = () => {
    if (hideDeleteConfirmation) {
      // If user set "hide_delete_confirmation", then no popup; just delete
      handleConfirmDelete();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  // Called when user confirms "Yes" in the confirm dialog
  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await onDelete(appointment.appointment_id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error deleting appointment';
      setError(message);
    }
  };

  // Sync the end time with the adjusted start time
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
                <span>{appointment.booked ? "Booked" : "Available"}</span>
              </div>
            </div>

            <div className={styles.buttonRow}>
              {!appointment.booked && (
                <>
                  <button className={styles.editButton} onClick={() => setEditMode(true)}>
                    Edit
                  </button>
                  <button className={styles.markBookedButton} onClick={handleMarkBooked}>
                    Mark as Booked
                  </button>
                  <button className={styles.deleteButton} onClick={handleDeleteClick}>
                    Delete
                  </button>
                </>
              )}
            </div>

            {appointment.booked && (
              <div className={styles.userInfoContainer}>
                <div className={styles.divider} />
                <h2 className={styles.userInfoTitle}>Patient Information</h2>
                <div className={styles.detailsForm}>
                  {appointment.user_id ? (
                    userInfo ? (
                      <>
                        {userInfo.first_name && userInfo.last_name && (
                          <div className={styles.detailRow}>
                            <label>Full Name:</label>
                            <span>{userInfo.first_name} {userInfo.last_name}</span>
                          </div>
                        )}
                        {userInfo.email && (
                          <div className={styles.detailRow}>
                            <label>Email:</label>
                            <span>{userInfo.email}</span>
                          </div>
                        )}
                        {userInfo.phone_number && (
                          <div className={styles.detailRow}>
                            <label>Phone:</label>
                            <span>{userInfo.phone_number}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p>Loading user info...</p>
                    )
                  ) : (
                    <p>Manually marked as booked. No patient information.</p>
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
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />

              <label>Start:</label>
              <input type="datetime-local" value={formStart} onChange={handleStartChange} />

              <label>End:</label>
              <input
                type="datetime-local"
                value={formEnd}
                onChange={(e) => setFormEnd(e.target.value)}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.buttonRow}>
              <button className={styles.saveButton} onClick={handleSave}>
                Save
              </button>
              <button className={styles.cancelButton} onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      {showDeleteConfirm && (
        <ConfirmDeletePopup
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          onDontShowAgain={(dontShow) => {
            // If user checks "Don't show again" and confirms,
            // we call the parent's callback to update preferences.
            onDontShowAgain(dontShow);
          }}
        />
      )}
    </div>
  );
};

export default AppointmentPopup;
