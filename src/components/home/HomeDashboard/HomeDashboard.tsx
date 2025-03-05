import { AppointmentCard } from "../AppointmentCard/AppointmentCard";
import { PracticeCard } from "../PracticeCard/PracticeCard";
import { ArticleCard } from "../ArticleCard/ArticleCard";
import styles from "./HomeDashboard.module.css";
import Link from "next/link";

interface HomeDashboardProps {
  appointments: Array<{
    id: string;
    practice: string;
    time: string;
    type: string;
    price: number;
    image: string;
  }>;
  topPractices: Array<{
    id: string;
    name: string;
    rating: number;
    reviews: number;
    image: string;
  }>;
  articles: Array<{
    id: number;
    title: string;
    image: string;
    excerpt: string;
  }>;
  hasGeoPermission: boolean;
}

export function HomeDashboard({
  appointments,
  topPractices,
  articles,
  hasGeoPermission,
}: HomeDashboardProps) {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Book Your Dental Visit Today</h1>
          <p className={styles.subtitle}>Unlock a world of available appointments at your fingertips</p>
          <Link href="/search" className={styles.ctaButton}>
            Search for Appointments
          </Link>
        </div>
      </header>

      <div className={styles.container}>
        <section className={`${styles.section} ${styles.fadeIn}`}>
          <h2 className={styles.sectionTitle}>
            {hasGeoPermission ? "Next Appointments Near You" : "Next Appointments"}
          </h2>
          <div className={styles.cardsGrid}>
            {appointments.length > 0 ? (
              appointments.slice(0, 5).map((appt) => (
                <AppointmentCard key={appt.id} {...appt} />
              ))
            ) : (
              <p>No upcoming appointments available.</p>
            )}
          </div>
        </section>

        <section className={`${styles.section} ${styles.fadeIn}`}>
          <h2 className={styles.sectionTitle}>
            {hasGeoPermission ? "Top Rated Practices Near You" : "Top Rated Practices"}
          </h2>
          <div className={styles.cardsGrid}>
            {topPractices.length > 0 ? (
              topPractices.slice(0, 5).map((practice) => (
                <PracticeCard key={practice.id} {...practice} />
              ))
            ) : (
              <p>No top-rated practices available.</p>
            )}
          </div>
        </section>

        <section className={`${styles.infoSection} ${styles.fadeIn}`}>
          <h2 className={styles.infoTitle}>Why Choose Us?</h2>
          <div className={styles.infoContent}>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p>
              Practices love us because they can easily list their cancelled or unbooked appointments, filling their schedules while offering you unbeatable convenience. Join thousands of happy patients and practices today!
            </p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.fadeIn}`}>
          <h2 className={styles.sectionTitle}>Dental Insights</h2>
          <div className={styles.cardsGrid}>
            {articles.map((article) => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}