// app/home/page.tsx
import { HomeDashboard } from "@/components/home/HomeDashboard/HomeDashboard";

export default async function Home() {
  const appointmentsData = [
    { id: 1, practice: "Smile Dental", time: "2025-02-25 10:00", type: "Cleaning", price: 80, image: "/dummy1.jpg" },
    { id: 2, practice: "Bright Teeth", time: "2025-02-25 14:30", type: "Check-up", price: 60, image: "/dummy2.jpg" },
    { id: 3, practice: "Perfect Smile", time: "2025-02-26 11:15", type: "Filling", price: 120, image: "/dummy3.jpg" },
    { id: 4, practice: "Glow Dental", time: "2025-02-27 09:30", type: "Whitening", price: 150, image: "/dummy4.jpg" },
    { id: 5, practice: "Healthy Smiles", time: "2025-02-27 15:00", type: "Check-up", price: 70, image: "/dummy5.jpg" },
    { id: 6, practice: "Pure Dental", time: "2025-02-28 13:45", type: "Cleaning", price: 85, image: "/dummy1.jpg" },
  ];

  const practicesData = [
    { id: 1, name: "Smile Dental", rating: 4.8, reviews: 124, image: "/dummy4.jpg" },
    { id: 2, name: "Bright Teeth", rating: 4.7, reviews: 98, image: "/dummy5.jpg" },
    { id: 3, name: "Perfect Smile", rating: 4.9, reviews: 156, image: "/dummy1.jpg" },
    { id: 4, name: "Glow Dental", rating: 4.6, reviews: 87, image: "/dummy2.jpg" },
    { id: 5, name: "Healthy Smiles", rating: 4.8, reviews: 135, image: "/dummy3.jpg" },
  ];

  const articlesData = [
    { id: 1, title: "Top 5 Dental Hygiene Tips", image: "/dummy2.jpg", excerpt: "Learn the essentials of perfect oral health." },
    { id: 2, title: "Why Regular Checkups Matter", image: "/dummy3.jpg", excerpt: "Prevention is better than cure." },
    { id: 3, title: "Best Foods for Teeth", image: "/dummy4.jpg", excerpt: "Eat your way to a brighter smile." },
    { id: 4, title: "Understanding Cavities", image: "/dummy5.jpg", excerpt: "What you need to know." },
  ];

  // const featuredDentist = {
  //   name: "Dr. Jane Smith",
  //   practice: "Smile Dental",
  //   specialty: "Cosmetic Dentistry",
  //   image: "/dummy4.jpg",
  // };

  return (
    <HomeDashboard
      appointments={appointmentsData}
      topPractices={practicesData}
      articles={articlesData}
      // featuredDentist={featuredDentist}
    />
  );
}