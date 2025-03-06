import Link from 'next/link';
import styles from './AppointmentCard.module.css';

interface AppointmentCardProps {
  id: string;
  practice: string;
  time: string;
  type: string;
  price: number;
  distance: number;
  city: string;
  hasPostcode: boolean;
  image: string;
  appointmentType: string;
}

export default function AppointmentCard({
  id,
  practice,
  time,
  type,
  price,
  distance,
  city,
  hasPostcode,
  image,
  appointmentType
}: AppointmentCardProps) {
  return (
    <div className={styles.card}>
      <Link href={{ pathname: `/appointments/${id}`, query: { from: "search", appointmentType } }} className={styles.cardLink}>        <img src={image} alt={practice} className={styles.image} />
        <div className={styles.content}>
          <h3 className={styles.practice}>{practice}</h3>
          <p className={styles.time}>{new Date(time).toLocaleString()}</p>
          <p className={styles.type}>{type.charAt(0).toUpperCase() + type.slice(1)}</p>
          <p className={styles.price}>£{price}</p>
          <p className={styles.distance}>
            {hasPostcode ? `${distance.toFixed(1)} miles away` : city}
          </p>
        </div>
      </Link>
      <div className={styles.detailsButtonWrapper}>
        <Link href={`/appointments/${id}`}>
          <button className={styles.detailsButton}>View Details</button>
        </Link>
      </div>
    </div>
  );
}
