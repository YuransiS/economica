'use server';

import * as db from './supabase';
import { MinicourseUser, MinicourseProgress, HomeworkStatus, MinicoursePrizeCode } from './types';

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

export async function acceptTerms(userId: string) {
  return db.acceptTerms(userId);
}

export async function extendStudentAccess(
  userId: string,
  lessonsOption: 'none' | 'reset' | 'extend7' | 'unlimited' | 'custom',
  homeworkOption: 'none' | 'reset' | 'extend7' | 'unlimited' | 'custom',
  customLessonsDays?: number,
  customHomeworkDays?: number
) {
  try {
    return await db.extendStudentAccess(userId, lessonsOption, homeworkOption, customLessonsDays, customHomeworkDays);
  } catch (err: any) {
    console.error("extendStudentAccess action error:", err);
    throw new Error(err.message || "Не вдалося оновити доступ.");
  }
}

export async function createPrizeCode(description: string, createdBy: string) {
  try {
    return await db.createPrizeCode(description, createdBy);
  } catch (err: any) {
    console.error("createPrizeCode action error:", err);
    throw new Error(err.message || "Не вдалося створити посилання.");
  }
}

export async function getPrizeCodes() {
  try {
    return await db.getPrizeCodes();
  } catch (err: any) {
    console.error("getPrizeCodes action error:", err);
    throw new Error(err.message || "Не вдалося отримати посилання.");
  }
}

export async function cancelPrizeCode(code: string) {
  try {
    return await db.cancelPrizeCode(code);
  } catch (err: any) {
    console.error("cancelPrizeCode action error:", err);
    throw new Error(err.message || "Не вдалося скасувати посилання.");
  }
}

export async function claimPrizeCode(code: string, name: string, telegram: string, phone?: string) {
  try {
    return await db.claimPrizeCode(code, name, telegram, phone);
  } catch (err: any) {
    console.error("claimPrizeCode action error:", err);
    throw new Error(err.message || "Не вдалося активувати безкоштовний доступ.");
  }
}

export async function getGiftTokens() {
  return db.getGiftTokens();
}

export async function generateGiftToken() {
  return db.generateGiftToken();
}

export type { AdminSubmissionItem, GiftTokenItem } from './supabase';



