export interface Designer {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  specialties: string[];
  experience: string;
  rating: number;
  reviewCount: number;
  workDays: number[]; // 1 = Mon, 7 = Sun
  availableTimes: string[];
}

export interface Service {
  id: string;
  name: string;
  category: 'cut' | 'perm' | 'color' | 'treatment';
  price: number;
  duration: number; // in minutes
  description: string;
  image: string;
  tags: string[];
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  designerId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  designerId: string;
  serviceName: string;
  rating: number;
  text: string;
  date: string;
}
