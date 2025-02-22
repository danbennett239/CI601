// components/home/AppointmentCard.tsx
import styles from "./AppointmentCard.module.css";

interface AppointmentCardProps {
  practice: string;
  time: string;
  type: string;
  price: number;
}

export function AppointmentCard({ practice, time, type, price }: AppointmentCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.practice}>{practice}</h3>
      <p className={styles.time}>{new Date(time).toLocaleString()}</p>
      <p className={styles.type}>{type}</p>
      <p className={styles.price}>${price}</p>
    </div>
  );
}