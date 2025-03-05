import Image from "next/image";
import Link from "next/link";
import styles from "./AppointmentCard.module.css";

interface AppointmentCardProps {
  id: string;
  practice: string;
  start_time: string;
  end_time: string;
  services: Record<string, number>;
  image: string;
  address: string;
}

export function AppointmentCard({ id, practice, start_time, end_time, services, image, address }: AppointmentCardProps) {
  const startDate = new Date(start_time);
  const endDate = new Date(end_time);
  const timeString = `${startDate.getHours().toString().padStart(2, "0")}:${startDate.getMinutes().toString().padStart(2, "0")} - ${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;
  const dateString = `${startDate.getDate().toString().padStart(2, "0")}/${(startDate.getMonth() + 1).toString().padStart(2, "0")}/${startDate.getFullYear()}`;
  const city = address.split(", ")[1]; // Extract city from "line1, city, postcode"

  // Sort services alphabetically by type
  const sortedServices = Object.entries(services).sort(([typeA], [typeB]) => typeA.localeCompare(typeB));

  return (
    <Link href={{ pathname: `/appointments/${id}`, query: { from: "home" } }} className={styles.cardLink}>
      <div className={styles.card}>
        <Image src={image} alt={practice} width={300} height={180} className={styles.image} />
        <div className={styles.content}>
          <h3 className={styles.practice}>{practice}</h3>
          <p className={styles.city}>{city}</p>
          <p className={styles.time}>{timeString}, {dateString}</p>
          <div className={styles.services}>
            {sortedServices.map(([type, price]) => (
              <div key={type} className={styles.service}>
                <span className={styles.type}>{type}</span>
                <span className={styles.price}>£{price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}