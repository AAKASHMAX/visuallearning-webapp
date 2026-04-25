export interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN" | "TEACHER";
  emailVerified?: boolean;
}

export interface ClassItem {
  id: string;
  name: string;
  displayOrder: number;
  subjects: Subject[];
  _count?: { subjects: number };
}

export interface Subject {
  id: string;
  name: string;
  classId: string;
  _count?: { chapters: number };
}

export interface Chapter {
  id: string;
  name: string;
  displayOrder: number;
  subjectId: string;
  _count?: {
    videos: number;
    notes: number;
    questions: number;
  };
}

export interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  videoType: "ANIMATED_VIDEO" | "LECTURE_VIDEO";
  language: string;
  isFree: boolean;
  displayOrder: number;
  chapterId: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  startDate: string;
  expiryDate: string;
  classesAccess: string[];
}
