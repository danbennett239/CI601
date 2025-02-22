// components/home/HomeDashboard.tsx
import { AppointmentCard } from "../AppointmentCard/AppointmentCard";
import { PracticeCard } from "../PracticeCard/PracticeCard";
import { ArticleCard } from "../ArticleCard/ArticleCard";
// import { FeaturedDentist } from "../FeaturedDentist/FeaturedDentist";
import styles from "./HomeDashboard.module.css";
import Link from "next/link";

interface HomeDashboardProps {
  appointments: Array<{ id: number; practice: string; time: string; type: string; price: number; image: string }>;
  topPractices: Array<{ id: number; name: string; rating: number; reviews: number; image: string }>;
  articles: Array<{ id: number; title: string; image: string; excerpt: string }>;
  featuredDentist: { name: string; practice: string; specialty: string; image: string };
}

export function HomeDashboard({ appointments, topPractices, articles, featuredDentist }: HomeDashboardProps) {
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
          <h2 className={styles.sectionTitle}>Next Available Appointments</h2>
          <div className={styles.cardsGrid}>
            {appointments.slice(0, 5).map((appt) => (
              <AppointmentCard key={appt.id} {...appt} />
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.fadeIn}`}>
          <h2 className={styles.sectionTitle}>Top Rated Practices</h2>
          <div className={styles.cardsGrid}>
            {topPractices.slice(0, 5).map((practice) => (
              <PracticeCard key={practice.id} {...practice} />
            ))}
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