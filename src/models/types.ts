/**
 * @fileOverview Definição central de tipos (Model) para o sistema HelpBarber.
 */

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // em minutos
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  customerId: string;
  barberId: string;
  date: string; // ISO string
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePictureId?: string;
}

export interface Barber {
  id: string;
  name: string;
  email: string;
  location: string;
  experience: number;
  specialties: string[];
  services: Service[];
  rating: number;
  profilePictureId: string;
  galleryImageIds: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Appointment {
  id: string;
  barberId: string;
  barberName: string;
  barberLocation: string;
  customerId: string;
  customerName: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: 'booked' | 'completed' | 'cancelled';
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
}