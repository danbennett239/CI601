// components/home/ArticleCard.tsx
import Image from "next/image";
import styles from "./ArticleCard.module.css";

interface ArticleCardProps {
  title: string;
  image: string;
  excerpt: string;
}

export function ArticleCard({ title, image, excerpt }: ArticleCardProps) {
  return (
    <div className={styles.card}>
      <Image src={image} alt={title} width={300} height={200} className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.excerpt}>{excerpt}</p>
      </div>
    </div>
  );
}