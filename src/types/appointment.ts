export interface AppointmentWithPractice {
  appointment_id: string;
  practice_id: string;
  user_id: string | null;
  title: string;
  start_time: string;
  end_time: string;
  booked: boolean;
  created_at: string;
  updated_at: string;
  services: Record<string, number>;
  practice: {
    practice_name: string;
    email: string;
    phone_number: string | null;
    photo: string | null;
    address: {
      line1: string;
      city: string;
      [key: string]: string;
    };
    opening_hours: Array<{
      dayName: string;
      open: string;
      close: string;
    }>;
    practice_reviews_aggregate: {
      aggregate: {
        avg: {
          rating: number | null;
        };
        count: number;
      };
    };
  };
}

export interface BookingAppointment {
  appointment_id: string;
  practice_id: string;
  title: string;
  start_time: string;
  end_time: string;
  booked: boolean;
  practice: {
    practice_name: string;
    email: string;
  };
}