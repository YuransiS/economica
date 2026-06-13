'use server';

import * as db from './supabase';
import { MinicourseUser, MinicourseProgress, HomeworkStatus } from './types';

export async function loginUser(telegramUsername: string, name?: string, deviceUuid?: string) {
  try {
    const result = await db.loginUser(telegramUsername, name, deviceUuid);
    return { success: true, user: result.user, progress: result.progress };
  } catch (err: any) {
    console.error("loginUser Server Action error:", err);
    return { success: false, error: err.message || "Не вдалося авторизуватися." };
  }
}

export async function getProfile(userId: string) {
  return db.getProfile(userId);
}

export async function getProgress(userId: string) {
  return db.getProgress(userId);
}

export async function updateProgress(userId: string, lessonId: 1 | 2 | 3, updates: any) {
  return db.updateProgress(userId, lessonId, updates);
}

export async function getLeaderboard(currentUserId?: string) {
  return db.getLeaderboard(currentUserId);
}

export async function syncProgressStates(userId: string, user?: MinicourseUser) {
  return db.syncProgressStates(userId, user);
}

export async function getLessonsConfig() {
  return db.getLessonsConfig();
}

export async function getAllStudentsWithProgress() {
  return db.getAllStudentsWithProgress();
}

export async function toggleUserLockout(userId: string, shouldBlock: boolean) {
  return db.toggleUserLockout(userId, shouldBlock);
}

export async function deleteStudentUser(userId: string) {
  return db.deleteStudentUser(userId);
}

export async function saveHomeworkReview(userId: string, lessonId: 1 | 2 | 3, status: HomeworkStatus, comment: string) {
  return db.saveHomeworkReview(userId, lessonId, status, comment);
}

export async function updateLessonConfig(lessonId: number, updates: any) {
  return db.updateLessonConfig(lessonId, updates);
}

export async function getAdminSubmissions() {
  return db.getAdminSubmissions();
}

