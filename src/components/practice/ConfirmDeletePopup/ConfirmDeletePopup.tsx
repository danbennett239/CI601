// components/practice/AppointmentPopup/ConfirmDeletePopup.tsx
import React, { useState } from 'react';
import styles from './ConfirmDeletePopup.module.css';

interface ConfirmDeletePopupProps {
  onConfirm: () => void;
  onCancel: () => void;
  onDontShowAgain: (dontShow: boolean) => void;
}

const ConfirmDeletePopup: React.FC<ConfirmDeletePopupProps> = ({
  onConfirm,
  onCancel,
  onDontShowAgain,
}) => {
  const [dontShow, setDontShow] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDontShow(e.target.checked);
  };

  const handleConfirm = () => {
    onDontShowAgain(dontShow);
    onConfirm();
  };

  return (
    <div className={styles.confirmOverlay}>
      <div className={styles.confirmContent}>
        <p>Are you sure you want to delete this appointment?</p>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" checked={dontShow} onChange={handleCheckboxChange} />
          Don&apos;t show this again
        </label>
        <div className={styles.buttonRow}>
          <button className={styles.confirmButton} onClick={handleConfirm}>Yes</button>
          <button className={styles.cancelButton} onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeletePopup;
