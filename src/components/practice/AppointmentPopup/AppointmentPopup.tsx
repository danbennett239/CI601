// components/AppointmentPopup.tsx
import React, { useEffect } from 'react';
import styles from './AppointmentPopup.module.css';
import { Appointment } from '../../../types/practice';

interface AppointmentPopupProps {
  appointment: Appointment;
  onClose: () => void;
}

const AppointmentPopup: React.FC<AppointmentPopupProps> = ({ appointment, onClose }) => {
  // Close the popup if the user clicks outside the popup content.
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
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className={styles.popupOverlay} onClick={handleOverlayClick}>
      <div className={styles.popupContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>Appointment Details</h2>
        <p><strong>Title:</strong> {appointment.title}</p>
        <p><strong>Start:</strong> {new Date(appointment.start).toLocaleString()}</p>
        <p><strong>End:</strong> {new Date(appointment.end).toLocaleString()}</p>
        <p><strong>Status:</strong> {appointment.booked ? "Booked" : "Available"}</p>
        { !appointment.booked && (
          <>
            <h3>Edit Appointment</h3>
            <label>
              Title:
              <input type="text" defaultValue={appointment.title} />
            </label>
            {/* Add additional form fields as needed */}
            <button className={styles.saveButton}>Save</button>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentPopup;
