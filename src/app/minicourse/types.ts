export type UserRole = 'student' | 'admin';

export type HomeworkStatus = 'not_started' | 'pending' | 'accepted' | 'needs_improvement';

export interface MinicourseUser {
  id: string;
  name: string;
  email?: string;
  telegram: string;
  telegram_chat_id?: number | null;
  phone?: string;
  role: UserRole;
  created_at: string;
  is_paid?: boolean;
  payment_status?: string;
  device_uuids?: string[];
  status?: 'active' | 'under_investigation';
}

export interface LessonProgress {
  unlocked: boolean;
  openedAt?: string; // ISO string
  hwSubmitted: boolean;
  hwUrl?: string;
  hwStatus: HomeworkStatus;
  hwComment?: string;
  hwSubmittedAt?: string; // ISO string
}

export interface MinicourseProgress {
  id: string;
  userId: string;
  progressPercent: number; // 0 to 100
  lessons: {
    1: LessonProgress;
    2: LessonProgress;
    3: LessonProgress;
  };
  updatedAt: string;
}

export interface MinicourseLessonConfig {
  lesson_id: number; // 1, 2, 3
  title: string;
  description: string;
  youtube_id: string;
  mindmap_url?: string;
  hw_spreadsheet_url?: string;
  notion_url?: string;
  hw_instructions: string;
  updated_at: string;
  bonus_video_title?: string;
  bonus_video_youtube_id?: string;
}

