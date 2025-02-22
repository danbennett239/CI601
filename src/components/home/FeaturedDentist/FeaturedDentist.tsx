// components/home/FeaturedDentist.tsx
import Image from "next/image";
import styles from "./FeaturedDentist.module.css";

interface FeaturedDentistProps {
  name: string;
  practice: string;
  specialty: string;
  image: string;
}

export function FeaturedDentist({ name, practice, specialty, image }: FeaturedDentistProps) {
  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <Image src={image} alt={name} width={400} height={400} className={styles.image} />
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>Featured Dentist</h2>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.practice}>{practice}</p>
        <p className={styles.specialty}>{specialty}</p>
        <button className={styles.button}>Learn More</button>
      </div>
    </div>
  );
}