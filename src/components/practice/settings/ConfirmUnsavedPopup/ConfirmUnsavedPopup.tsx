// components/ConfirmUnsavedPopup/ConfirmUnsavedPopup.tsx
import React from "react";
import styles from "./ConfirmUnsavedPopup.module.css";

interface ConfirmUnsavedPopupProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmUnsavedPopup: React.FC<ConfirmUnsavedPopupProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <p>You have unsaved changes. Are you sure you want to leave without saving?</p>
        <div className={styles.buttonRow}>
          <button className={styles.confirmButton} onClick={onConfirm}>Yes</button>
          <button className={styles.cancelButton} onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmUnsavedPopup;
