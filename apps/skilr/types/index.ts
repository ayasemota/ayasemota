import { Timestamp } from "firebase/firestore";

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pin?: string;
  status?: string;
  unclearedAmount?: number;
}

export interface Payment {
  id: string | number;
  amount: number;
  date: string;
  paymentDate: string;
  paymentTime: string;
  status: string;
  reference: string;
  userEmail: string;
  createdAt: Timestamp;
}

export interface PaymentStats {
  totalAmount: number;
  weekAmount: number;
}

export interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
  trxref: string;
}

export interface Event {
  id?: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  isVisible: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Announcement {
  id?: string;
  title: string;
  description: string;
  isVisible: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}