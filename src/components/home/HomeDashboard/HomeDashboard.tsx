// components/home/HomeDashboard.tsx
import { AppointmentCard } from "../AppointmentCard/AppointmentCard";
import { PracticeCard } from "../PracticeCard/PracticeCard";
import { ArticleCard } from "../ArticleCard/ArticleCard";
import styles from "./HomeDashboard.module.css";
import Link from "next/link";

interface HomeDashboardProps {
  appointments: Array<{
    id: number;
    practice: string;
    time: string;
    type: string;
    price: number;
  }>;
  topPractices: Array<{
    id: number;
    name: string;
    rating: number;
    reviews: number;
  }>;
  articles: Array<{
    id: number;
    title: string;
    image: string;
  }>;
}

export function HomeDashboard({ appointments, topPractices, articles }: HomeDashboardProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Find Your Dental Appointment</h1>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search by location, practice, or treatment..."
            className={styles.searchInput}
          />
          <Link href="/search" className={styles.searchButton}>
            Search
          </Link>
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Available Appointments</h2>
        <div className={styles.cardsGrid}>
          {appointments.map((appt) => (
            <AppointmentCard key={appt.id} {...appt} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Top Rated Practices</h2>
        <div className={styles.cardsGrid}>
          {topPractices.map((practice) => (
            <PracticeCard key={practice.id} {...practice} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dental Health Tips</h2>
        <div className={styles.cardsGrid}>
          {articles.map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </section>
    </div>
  );
}