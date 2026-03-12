export interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  emailVerified?: boolean;
  createdAt?: string;
  subscription?: Subscription | null;
}

export type Language = "ENGLISH" | "HINDI" | "MARATHI" | "TAMIL" | "TELUGU";

export interface Subscription {
  id: string;
  plan: "MONTHLY" | "YEARLY" | "SINGLE_CLASS" | "MULTI_CLASS" | "FULL_ACCESS";
  classesAccess: string[];
  startDate: string;
  expiryDate: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  amount: number;
}

export interface ClassItem {
  id: string;
  name: string;
  order: number;
  _count?: { subjects: number };
}

export interface Subject {
  id: string;
  classId: string;
  name: string;
  icon?: string;
  _count?: { chapters: number };
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  order: number;
  _count?: { videos: number; notes: number; questions: number };
}

export interface Video {
  id: string;
  chapterId: string;
  title: string;
  youtubeVideoId: string | null;
  language: Language;
  duration?: string;
  order: number;
  isFree: boolean;
  locked?: boolean;
}

export interface Note {
  id: string;
  chapterId: string;
  title: string;
  pdfUrl: string;
}

export interface Question {
  id: string;
  chapterId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  solution?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  classSelection?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
