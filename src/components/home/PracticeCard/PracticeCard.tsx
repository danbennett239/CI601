// components/home/PracticeCard.tsx
import Image from "next/image";
import styles from "./PracticeCard.module.css";

interface PracticeCardProps {
  name: string;
  rating: number;
  reviews: number;
  image: string;
}

export function PracticeCard({ name, rating, reviews, image }: PracticeCardProps) {
  return (
    <div className={styles.card}>
      <Image src={image} alt={name} width={300} height={180} className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <div className={styles.rating}>
          <span className={styles.stars}>★★★★★</span>
          <span>{rating} ({reviews} reviews)</span>
        </div>
      </div>
    </div>
  );
}