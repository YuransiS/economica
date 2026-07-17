export type UserRole = 'student' | 'admin';

export type HomeworkStatus = 'not_started' | 'pending' | 'accepted' | 'needs_improvement' | 'expired_not_submitted';

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
  access_opened_at?: string;
  homework_access_opened_at?: string;
  terms_accepted?: boolean;
}

export interface MinicoursePrizeCode {
  code: string;
  description?: string;
  created_by?: string;
  created_at: string;
  used_at?: string;
  used_by_id?: string;
  status: 'active' | 'used' | 'cancelled';
  used_by_name?: string;
  used_by_telegram?: string;
}

export interface LessonProgress {
  unlocked: boolean;
  openedAt?: string; // ISO string
  hwSubmitted: boolean;
  hwUrl?: string;
  hwStatus: HomeworkStatus;
  hwComment?: string;
  hwSubmittedAt?: string; // ISO string
  reminderSent?: boolean;
  videoWatchedSec?: number;
  videoDurationSec?: number;
  videoCompleted?: boolean;
  videoCompletedAt?: string;
  qstashMsgId?: string | null;
  notificationStatus?: 'pending' | 'sent' | 'cancelled' | null;
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
  youtube_id_new?: string;
  mindmap_url?: string;
  hw_spreadsheet_url?: string;
  notion_url?: string;
  hw_instructions: string;
  updated_at: string;
  bonus_video_title?: string;
  bonus_video_youtube_id?: string;
  bonus_video_youtube_id_new?: string;
}

export interface StudentWithProgress extends MinicourseUser {
  progress?: MinicourseProgress;
}

