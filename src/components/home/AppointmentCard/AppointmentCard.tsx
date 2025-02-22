// components/home/AppointmentCard.tsx
import Image from "next/image";
import styles from "./AppointmentCard.module.css";

interface AppointmentCardProps {
  practice: string;
  time: string;
  type: string;
  price: number;
  image: string;
}

export function AppointmentCard({ practice, time, type, price, image }: AppointmentCardProps) {
  return (
    <div className={styles.card}>
      <Image src={image} alt={practice} width={300} height={180} className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.practice}>{practice}</h3>
        <p className={styles.time}>{new Date(time).toLocaleString()}</p>
        <div className={styles.details}>
          <span className={styles.type}>{type}</span>
          <span className={styles.price}>${price}</span>
        </div>
      </div>
    </div>
  );
}