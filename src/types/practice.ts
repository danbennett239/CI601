export interface Practice {
  practice_id: string;
  practice_name: string;
  email: string;
  phone_number: string;
  photo?: string;
  address: Address
  opening_hours: Array<{ dayName: string; open: string; close: string }>;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
  verified_at?: string;
}
export interface Address {
  line1: string;
  line2?: string;
  line3?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}
