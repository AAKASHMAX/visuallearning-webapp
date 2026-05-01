export interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  emailVerified?: boolean;
}

export interface Course {
  id: string;
  name: string;
  description: string | null;
  tier: string;
  displayOrder: number;
  isActive: boolean;
  chapters: Chapter[];
  _count?: { chapters: number };
}

export interface Chapter {
  id: string;
  name: string;
  displayOrder: number;
  courseId: string;
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
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  couponCode?: string;
  discountAmount: number;
  amount: number;
}
