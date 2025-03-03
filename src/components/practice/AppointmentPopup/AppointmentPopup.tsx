import React, { useState, useEffect } from 'react';
import styles from './AppointmentPopup.module.css';
import { Appointment, OpeningHoursItem } from '@/types/practice';
import ConfirmDeletePopup from '../ConfirmDeletePopup/ConfirmDeletePopup';
import { editAppointmentSchema } from '@/schemas/practiceSchemas';

interface AppointmentPopupProps {
  appointment: Appointment;
  openingHours: OpeningHoursItem[];
  practiceServices: Record<string, number>;
  hideDeleteConfirmation: boolean;
  onClose: () => void;
  onUpdate: (updateData: Partial<Appointment>) => Promise<void>;
  onDelete: (appointmentId: string) => Promise<void>;
  onDontShowAgain: (dontShow: boolean) => void;
}

const AppointmentPopup: React.FC<AppointmentPopupProps> = ({
  appointment,
  openingHours,
  practiceServices,
  hideDeleteConfirmation,
  onClose,
  onUpdate,
  onDelete,
  onDontShowAgain,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [formStart, setFormStart] = useState(appointment.start_time.slice(0, 16));
  const [formEnd, setFormEnd] = useState(appointment.end_time.slice(0, 16));
  const [allTypes, setAllTypes] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(Object.keys(appointment.services || {}));
  const [error, setError] = useState<string>('');
  const [userInfo, setUserInfo] = useState<Record<string, string> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBookingDropdown, setShowBookingDropdown] = useState(false);
  const [selectedBookingType, setSelectedBookingType] = useState<string>('');

  const appointmentTypes = Object.keys(practiceServices);
  const originalDuration =
    new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime();

  const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  // Generate title dynamically
  const generateTitle = () => {
    if (appointment.booked && appointment.booked_service) {
      const baseTitle = capitalizeFirstLetter(appointment.booked_service.type);
      return appointment.user_id && userInfo?.first_name && userInfo?.last_name
        ? `${baseTitle} - ${userInfo.first_name} ${userInfo.last_name}`
        : baseTitle;
    }
    const servicesList = Object.keys(appointment.services || {}).map(capitalizeFirstLetter).join(', ');
    return servicesList || 'Available Appointment';
  };

  const displayTitle = generateTitle();

  // Sync allTypes with selectedTypes
  useEffect(() => {
    const allSelected = appointmentTypes.every((type) => selectedTypes.includes(type));
    setAllTypes(allSelected && appointmentTypes.length > 0);
  }, [selectedTypes, appointmentTypes]);

  // Fetch user info if booked and user_id exists
  useEffect(() => {
    if (appointment.user_id) {
      fetch(`/api/user/${appointment.user_id}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setUserInfo(data.user);
          }
        })
        .catch((err) => console.error('Error fetching user info:', err));
    }
  }, [appointment.user_id]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowBookingDropdown(false);
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).classList.contains(styles.popupOverlay)) {
      setShowBookingDropdown(false);
      onClose();
    }
  };

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
    const services = selectedTypes.reduce((acc, type) => {
      acc[type] = practiceServices[type] || 0;
      return acc;
    }, {} as Record<string, number>);
    const parseResult = editAppointmentSchema.safeParse({
      start_time: formStart,
      end_time: formEnd,
      services,
    });
    if (!parseResult.success) {
      setError(parseResult.error.errors.map(err => err.message).join(', '));
      return;
    }
    if (!validateWithinOpeningHours(formStart, formEnd)) return;

    const updatedTitle = Object.keys(services).map(capitalizeFirstLetter).join(', ') || 'Available Appointment';

    try {
      await onUpdate({
        title: updatedTitle,
        start_time: formStart,
        end_time: formEnd,
        services,
      });
      setEditMode(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error updating appointment';
      setError(message);
    }
  };

  const handleMarkBookedClick = () => {
    setShowBookingDropdown(true);
    setSelectedBookingType(Object.keys(appointment.services || {})[0] || '');
  };

  const handleBookingConfirm = async () => {
    if (!selectedBookingType) {
      setError('Please select a service type.');
      return;
    }
    setError('');
    const bookedTitle = capitalizeFirstLetter(selectedBookingType);
    try {
      await onUpdate({
        title: bookedTitle,
        booked: true,
        booked_service: {
          type: selectedBookingType,
          price: appointment.services[selectedBookingType] || 0,
        },
      });
      setShowBookingDropdown(false);
      onClose(); // Close the popup after successful update
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error marking appointment as booked';
      setError(message);
    }
  };

  const handleBookingCancel = () => {
    setShowBookingDropdown(false);
    setSelectedBookingType('');
  };

  const handleDeleteClick = () => {
    if (hideDeleteConfirmation) {
      handleConfirmDelete();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await onDelete(appointment.appointment_id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error deleting appointment';
      setError(message);
    }
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setFormStart(newStart);
    const newStartDate = new Date(newStart);
    const newEndDate = new Date(newStartDate.getTime() + originalDuration);
    setFormEnd(newEndDate.toISOString().slice(0, 16));
  };

  const handleAllTypesChange = (checked: boolean) => {
    setAllTypes(checked);
    setSelectedTypes(checked ? appointmentTypes : []);
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    setSelectedTypes((prev) =>
      checked ? [...prev, type] : prev.filter((t) => t !== type)
    );
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
                <span>{displayTitle}</span>
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
              <div className={styles.detailRow}>
                <label>{appointment.booked ? "Booked Service" : "Available Services"}:</label>
                <span>
                  {appointment.booked && appointment.booked_service
                    ? `${capitalizeFirstLetter(appointment.booked_service.type)} (£${appointment.booked_service.price})`
                    : Object.entries(appointment.services || {}).map(([type, price]) => (
                        `${capitalizeFirstLetter(type)} (£${price})`
                      )).join(', ') || 'None'}
                </span>
              </div>
              {!appointment.booked && showBookingDropdown && (
                <div className={`${styles.bookingSection} ${styles.fadeIn}`}>
                  <div className={styles.divider} />
                  <h3 className={styles.bookingTitle}>Choose Manual Booking Service</h3>
                  <select
                    value={selectedBookingType}
                    onChange={(e) => setSelectedBookingType(e.target.value)}
                    className={styles.bookingDropdown}
                  >
                    <option value="">Select a service</option>
                    {Object.keys(appointment.services || {}).map((type) => (
                      <option key={type} value={type}>
                        {capitalizeFirstLetter(type)} (£{appointment.services[type]})
                      </option>
                    ))}
                  </select>
                  <div className={styles.bookingButtonRow}>
                    <button
                      className={styles.confirmBookingButton}
                      onClick={handleBookingConfirm}
                    >
                      Confirm Booking
                    </button>
                    <button
                      className={styles.cancelBookingButton}
                      onClick={handleBookingCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!showBookingDropdown && (
              <div className={styles.buttonRow}>
                {!appointment.booked && (
                  <>
                    <button className={styles.editButton} onClick={() => setEditMode(true)}>
                      Edit
                    </button>
                    <button className={styles.markBookedButton} onClick={handleMarkBookedClick}>
                      Mark as Booked
                    </button>
                    <button className={styles.deleteButton} onClick={handleDeleteClick}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}

            {appointment.booked && (
              <div className={styles.userInfoContainer}>
                <div className={styles.divider} />
                <h2 className={styles.userInfoTitle}>Booking Information</h2>
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
              <label>Start:</label>
              <input type="datetime-local" value={formStart} onChange={handleStartChange} />

              <label>End:</label>
              <input
                type="datetime-local"
                value={formEnd}
                onChange={(e) => setFormEnd(e.target.value)}
              />

              <div className={styles.appointmentTypeSection}>
                <h3>Appointment Type</h3>
                <p className={styles.appointmentTypeSectionInfo}>
                  Select the services available for this appointment slot.
                </p>
                <div className={styles.checkboxContainer}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={allTypes}
                      onChange={(e) => handleAllTypesChange(e.target.checked)}
                    />
                    All
                  </label>
                  <hr className={styles.divider} />
                  {appointmentTypes.map((type) => (
                    <label key={type} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={(e) => handleTypeChange(type, e.target.checked)}
                      />
                      {capitalizeFirstLetter(type)} (£{practiceServices[type] || 0})
                    </label>
                  ))}
                </div>
              </div>
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
          onDontShowAgain={(dontShow) => onDontShowAgain(dontShow)}
        />
      )}
    </div>
  );
};

export default AppointmentPopup;