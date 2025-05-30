import React, { useState, useEffect } from "react";
import styles from "./CreateAppointmentPopup.module.css";
import { OpeningHoursItem, Appointment } from "@/types/practice";
import { toast } from "react-toastify";
import { createAppointmentSchema } from '@/schemas/practiceSchemas';

interface CreateAppointmentPopupProps {
  practiceId: string;
  openingHours: OpeningHoursItem[];
  defaultStart: Date;
  defaultEnd: Date;
  practiceServices: Record<string, number>;
  onClose: () => void;
  onCreated: (appointment: Appointment) => void;
}

const CreateAppointmentPopup: React.FC<CreateAppointmentPopupProps> = ({
  practiceId,
  openingHours,
  defaultStart,
  defaultEnd,
  practiceServices,
  onClose,
  onCreated,
}) => {
  const [start, setStart] = useState(defaultStart.toISOString().slice(0, 16));
  const [end, setEnd] = useState(defaultEnd.toISOString().slice(0, 16));
  const appointmentTypes = Object.keys(practiceServices);
  const [allTypes, setAllTypes] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(appointmentTypes);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const allSelected = appointmentTypes.every((type) => selectedTypes.includes(type));
    setAllTypes(allSelected && appointmentTypes.length > 0);
  }, [selectedTypes, appointmentTypes]);

  const handleAllTypesChange = (checked: boolean) => {
    setAllTypes(checked);
    setSelectedTypes(checked ? appointmentTypes : []);
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    setSelectedTypes((prev) =>
      checked ? [...prev, type] : prev.filter((t) => t !== type)
    );
  };

  const generateTitle = () => {
    const servicesList = selectedTypes.map(capitalizeFirstLetter).join(', ');
    return servicesList || 'Available Appointment';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const services = selectedTypes.reduce((acc: Record<string, number>, type) => {
      acc[type] = practiceServices[type] || 0;
      return acc;
    }, {});

    const parseResult = createAppointmentSchema.safeParse({
      start_time: start,
      end_time: end,
      services,
    });

    if (!parseResult.success) {
      setError(parseResult.error.errors.map(err => err.message).join(', '));
      toast.error("Validation failed. Check the form.");
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const dayName = startDate.toLocaleDateString("en-US", { weekday: "long" });
    const dayOpening = openingHours.find((oh) => oh.dayName === dayName);
    if (
      !dayOpening ||
      dayOpening.open.toLowerCase() === "closed" ||
      dayOpening.close.toLowerCase() === "closed"
    ) {
      setError(`The practice is closed on ${dayName}`);
      return;
    }

    const [openHour, openMinute] = dayOpening.open.split(":").map(Number);
    const [closeHour, closeMinute] = dayOpening.close.split(":").map(Number);
    const openDate = new Date(startDate);
    openDate.setHours(openHour, openMinute, 0, 0);
    const closeDate = new Date(startDate);
    closeDate.setHours(closeHour, closeMinute, 0, 0);
    if (startDate < openDate || endDate > closeDate) {
      setError(`Appointment must be within opening hours: ${dayOpening.open} - ${dayOpening.close}`);
      return;
    }

    const title = generateTitle();

    try {
      const response = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practice_id: practiceId,
          title,
          start_time: start,
          end_time: end,
          services,
        }),
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

  const capitalizeFirstLetter = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div
      className={styles.popupOverlay}
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains(styles.popupOverlay)) {
          onClose();
        }
      }}
    >
      <div className={styles.popupContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2>Create Appointment</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Start:
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
              data-cy="start-time-input"
            />
          </label>
          <label>
            End:
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
              data-cy="end-time-input"
            />
          </label>
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
                  data-cy="all-types-checkbox"
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
                    data-cy={`${type}-checkbox`}
                  />
                  {capitalizeFirstLetter(type)} (£{practiceServices[type] || 0})
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className={styles.saveButton} data-cy="popup-create-appointment-button">
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAppointmentPopup;