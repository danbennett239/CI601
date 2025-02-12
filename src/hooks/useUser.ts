// hooks/useUser.ts
import { useEffect, useState } from "react";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  practice_id?: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        // This endpoint should return a JSON object with a "user" property
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  return { user, loading };
}
