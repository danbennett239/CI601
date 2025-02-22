// components/home/ArticleCard.tsx
import Image from "next/image";
import styles from "./ArticleCard.module.css";

interface ArticleCardProps {
  title: string;
  image: string;
}

export function ArticleCard({ title, image }: ArticleCardProps) {
  return (
    <div className={styles.card}>
      <Image
        src={image}
        alt={title}
        width={280}
        height={160}
        className={styles.image}
      />
      <h3 className={styles.title}>{title}</h3>
    </div>
  );
}