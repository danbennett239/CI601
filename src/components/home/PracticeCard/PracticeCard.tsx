// components/home/PracticeCard.tsx
import styles from "./PracticeCard.module.css";

interface PracticeCardProps {
  name: string;
  rating: number;
  reviews: number;
}

export function PracticeCard({ name, rating, reviews }: PracticeCardProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.name}>{name}</h3>
      <div className={styles.rating}>
        <span>★</span> {rating} ({reviews} reviews)
      </div>
    </div>
  );
}