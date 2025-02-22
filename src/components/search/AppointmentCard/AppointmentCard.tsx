import Link from 'next/link';
import styles from './AppointmentCard.module.css';

interface AppointmentCardProps {
  id: number;
  practice: string;
  time: string;
  type: string;
  price: number;
  distance: number;
  image: string;
}

export default function AppointmentCard({ id, practice, time, type, price, distance, image }: AppointmentCardProps) {
  return (
    <div className={styles.card}>
      <img src={image} alt={practice} className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.practice}>{practice}</h3>
        <p className={styles.time}>{new Date(time).toLocaleString()}</p>
        <p className={styles.type}>{type}</p>
        <p className={styles.price}>£{price}</p>
        <p className={styles.distance}>{distance} miles away</p>
        <Link href={`/appointments/${id}`} className={styles.detailsButton}>
          View Details
        </Link>
      </div>
    </div>
  );
}