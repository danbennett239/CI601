import Image from "next/image";
import styles from "./PracticeCard.module.css";

interface PracticeCardProps {
  name: string;
  rating: number;
  reviews: number;
  image: string;
}

export function PracticeCard({ name, rating, reviews, image }: PracticeCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100; // 0-100% fill per star
      stars.push(
        <span key={i} className={styles.star}>
          <span className={styles.filledStar} style={{ width: `${fillPercentage}%` }}>★</span>
          <span className={styles.emptyStar}>☆</span>
        </span>
      );
    }
    return <span className={styles.stars}>{stars}</span>;
  };

  return (
    <div className={styles.card}>
      <Image src={image} alt={name} width={300} height={180} className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <div className={styles.rating}>
          {renderStars(rating)}
          <span>{rating.toFixed(1)} ({reviews} reviews)</span>
        </div>
      </div>
    </div>
  );
}