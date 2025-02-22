// app/home/page.tsx
import { HomeDashboard } from "@/components/home/HomeDashboard/HomeDashboard";

export default async function Home() {
  // In a real app, this would fetch from Hasura GraphQL
  const appointmentsData = [
    { id: 1, practice: "Smile Dental", time: "2025-02-25 10:00", type: "Cleaning", price: 80 },
    { id: 2, practice: "Bright Teeth", time: "2025-02-25 14:30", type: "Check-up", price: 60 },
    { id: 3, practice: "Perfect Smile", time: "2025-02-26 11:15", type: "Filling", price: 120 },
  ];

  const practicesData = [
    { id: 1, name: "Smile Dental", rating: 4.8, reviews: 124 },
    { id: 2, name: "Bright Teeth", rating: 4.7, reviews: 98 },
    { id: 3, name: "Perfect Smile", rating: 4.9, reviews: 156 },
  ];

  const articlesData = [
    { id: 1, title: "Top 5 Dental Hygiene Tips", image: "/dummy1.jpg" },
    { id: 2, title: "Why Regular Checkups Matter", image: "/dummy2.jpg" },
  ];

  return (
    <HomeDashboard
      appointments={appointmentsData}
      topPractices={practicesData}
      articles={articlesData}
    />
  );
}