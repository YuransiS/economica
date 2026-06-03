import { createClient } from '@supabase/supabase-js';
import { MinicourseUser, MinicourseProgress, HomeworkStatus, LessonProgress, MinicourseLessonConfig } from './types';

// Read keys from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize actual Supabase client if keys are present
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const IS_MOCK_MODE = !supabase;

if (IS_MOCK_MODE) {
  console.warn("⚠️ Supabase credentials not found. Mini-Course Platform is running in MOCK MODE (LocalStorage-backed).");
}

// Initial mockup data if LocalStorage is empty
const DEFAULT_USERS: MinicourseUser[] = [
  { id: 'admin-sofifinsight', name: 'Адміністратор Owner (Софія)', email: 'sofifinsight@finsight.com', telegram: 'sofifinsight', role: 'admin', created_at: new Date().toISOString(), is_paid: true, payment_status: 'paid', device_uuids: [], status: 'active' },
  { id: 'admin-yuransis', name: 'Адміністратор YuransiS', email: 'yuransis@finsight.com', telegram: 'yuransis', role: 'admin', created_at: new Date().toISOString(), is_paid: true, payment_status: 'paid', device_uuids: [], status: 'active' },
  { id: 'admin-jeniaproop', name: 'Адміністратор JeniaProop', email: 'jeniaproop@finsight.com', telegram: 'jeniaproop', role: 'admin', created_at: new Date().toISOString(), is_paid: true, payment_status: 'paid', device_uuids: [], status: 'active' },
  { id: 'admin-anya-koorator', name: 'Адміністратор Anya-Koorator', email: 'anya-koorator@finsight.com', telegram: 'anya-koorator', role: 'admin', created_at: new Date().toISOString(), is_paid: true, payment_status: 'paid', device_uuids: [], status: 'active' },
];

const DEFAULT_PROGRESS: MinicourseProgress[] = [];


// Helper functions for mock storage
function getLocalUsers(): MinicourseUser[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  const data = localStorage.getItem('minicourse_users');
  if (!data) {
    localStorage.setItem('minicourse_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    const parsed = JSON.parse(data) as MinicourseUser[];
    // Clear out unrealistic placeholder student records
    const cleaned = parsed.filter(u => 
      u.role === 'admin' || 
      (u.role === 'student' && 
       !u.id.startsWith('mock-') && 
       (!u.email || (!u.email.includes('alex_invest') && !u.email.includes('student'))) && 
       !u.name.includes('Алекс') && 
       !u.name.includes('Студент') && 
       !u.name.includes('Марія'))
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem('minicourse_users', JSON.stringify(cleaned));
      return cleaned;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_USERS;
  }
}

function saveLocalUsers(users: MinicourseUser[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('minicourse_users', JSON.stringify(users));
  }
}

function getLocalProgress(): MinicourseProgress[] {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  const data = localStorage.getItem('minicourse_progress');
  if (!data) {
    localStorage.setItem('minicourse_progress', JSON.stringify(DEFAULT_PROGRESS));
    return DEFAULT_PROGRESS;
  }
  try {
    const parsed = JSON.parse(data) as MinicourseProgress[];
    const validUserIds = new Set(getLocalUsers().map(u => u.id));
    const cleaned = parsed.filter(p => validUserIds.has(p.userId));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem('minicourse_progress', JSON.stringify(cleaned));
      return cleaned;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_PROGRESS;
  }
}

function saveLocalProgress(progress: MinicourseProgress[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('minicourse_progress', JSON.stringify(progress));
  }
}

export const DEFAULT_LESSONS_CONFIG: MinicourseLessonConfig[] = [
  {
    lesson_id: 1,
    title: "Перший ефір",
    description: "Створення першого інвестиційного плану",
    youtube_id: "SnyxALmvvnE",
    mindmap_url: "https://mm.tt/map/3978357799?t=cIsPiI7Jsq",
    hw_spreadsheet_url: "https://docs.google.com/spreadsheets/d/1xptWzJrSQ8aW2pOyuWpSH7P-4_tOJ6i04iB2-roF9kw/edit?usp=sharing",
    hw_instructions: `ВАЖЛИВО! Починаємо роботу лише в скопійованій таблиці!

Зробіть копію таблиці за посиланням нижче.

Заповніть її за відповідними критеріями відповідно до ефіру.

Після заповнення таблиці відкрийте доступ «всім, у кого є посилання».

Надішліть посилання у вікно праворуч для перевірки.`,
    updated_at: new Date().toISOString()
  },
  {
    lesson_id: 2,
    title: "Другий ефір",
    description: "Робота з капіталом та брокерськими рахунками",
    youtube_id: "l4p1F9oy3ko",
    mindmap_url: "https://mm.tt/map/3979303280?t=HfkclCi41H",
    hw_spreadsheet_url: "https://docs.google.com/spreadsheets/d/1UhFeWJyezb4W_t5jkesOvjiAe6l5SNDf/edit?gid=1880085387#gid=1880085387",
    hw_instructions: `! ВАЖЛИВО! Працюємо лише в скопійованій таблиці.

Зробіть копію таблиці за посиланням нижче.

Ваше завдання — заповнити таблицю відповідно до критеріїв.

Після виконання відкрийте доступ «всім, у кого є посилання».

Надішліть посилання на перевірку.`,
    updated_at: new Date().toISOString()
  },
  {
    lesson_id: 3,
    title: "Третій ефір",
    description: "Купівля першої акції та диверсифікація",
    youtube_id: "-p6u77YkyCw",
    mindmap_url: "https://mm.tt/map/3663819169?t=B79jLpx0HT",
    notion_url: "https://soapy-floss-c69.notion.site/33f9215c3f2180cf93e7e4f3bc7527d4",
    hw_instructions: `Виконайте фінальні кроки для завершення курсу:

Пройдіть тест і визначте свій ризик-профіль в інвестиціях.

Відкрийте 2 брокерські рахунки (InteractiveBrokers та Freedom Finance Europe).

Поповніть свій рахунок (сума будь-яка). Для розіграшу акцій від 100€.

Надішліть скрін купленої вашої першої акції.`,
    updated_at: new Date().toISOString(),
    bonus_video_title: "Покрокова інструкція, як придбати першу акцію",
    bonus_video_youtube_id: "BB0EeSsSM4s"
  }
];

function getLocalLessonsConfig(): MinicourseLessonConfig[] {
  if (typeof window === 'undefined') return DEFAULT_LESSONS_CONFIG;
  const data = localStorage.getItem('minicourse_lessons_config');
  if (!data) {
    localStorage.setItem('minicourse_lessons_config', JSON.stringify(DEFAULT_LESSONS_CONFIG));
    return DEFAULT_LESSONS_CONFIG;
  }
  return JSON.parse(data);
}

function saveLocalLessonsConfig(config: MinicourseLessonConfig[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('minicourse_lessons_config', JSON.stringify(config));
  }
}

// Calculate total progress percentage out of 100
export function calculateProgressPercent(lessons: MinicourseProgress['lessons']): number {
  let points = 0;
  // 6 checkpoints: 3 views, 3 homework approvals
  if (lessons[1].openedAt) points += 1;
  if (lessons[1].hwStatus === 'accepted') points += 1;
  
  if (lessons[2].openedAt) points += 1;
  if (lessons[2].hwStatus === 'accepted') points += 1;
  
  if (lessons[3].openedAt) points += 1;
  if (lessons[3].hwStatus === 'accepted') points += 1;

  return Math.round((points / 6) * 100);
}

// Platform API Layer
export async function loginUser(telegramUsername: string, name?: string, deviceUuid?: string): Promise<{ user: MinicourseUser; progress: MinicourseProgress }> {
  const normInput = telegramUsername.replace(/^@/, '').trim().toLowerCase();
  const digitsOnly = normInput.replace(/\D/g, '');

  if (IS_MOCK_MODE) {
    const users = getLocalUsers();
    let user = users.find(u => 
      (u.telegram && u.telegram.toLowerCase() === normInput) ||
      (digitsOnly && u.phone && u.phone.replace(/\D/g, '') === digitsOnly)
    );
    
    if (!user) {
      // Auto-register new student but mark as unpaid so they are prompted to pay
      user = {
        id: 'u-' + Math.random().toString(36).substr(2, 9),
        name: name || normInput,
        telegram: normInput,
        phone: digitsOnly || undefined,
        role: 'student',
        is_paid: false,
        payment_status: 'pending',
        device_uuids: [],
        status: 'active',
        created_at: new Date().toISOString()
      };
      users.push(user);
      saveLocalUsers(users);
    }

    const activeUser = user as MinicourseUser;

    if (activeUser.role === 'student') {
      if (!activeUser.is_paid) {
        throw new Error("Практикум ще не сплачено. Оплатіть участь на головній сторінці для отримання доступу.");
      }
      if (activeUser.status === 'under_investigation') {
        throw new Error("Доступ заблоковано. Зафіксовано вхід з великої кількості пристроїв. Будь ласка, зверніться в підтримку.");
      }

      if (deviceUuid) {
        const uuids = activeUser.device_uuids || [];
        if (!uuids.includes(deviceUuid)) {
          if (uuids.length >= 4) {
            activeUser.status = 'under_investigation';
            activeUser.device_uuids = [...uuids, deviceUuid];
            saveLocalUsers(users);
            throw new Error("Доступ заблоковано. Зафіксовано вхід з 5 унікальних пристроїв. Зверніться до підтримки.");
          } else {
            activeUser.device_uuids = [...uuids, deviceUuid];
            saveLocalUsers(users);
          }
        }
      }
    }

    const progressList = getLocalProgress();
    let progress = progressList.find(p => p.userId === activeUser.id);
    if (!progress) {
      progress = {
        id: 'p-' + Math.random().toString(36).substr(2, 9),
        userId: activeUser.id,
        progressPercent: 0,
        lessons: {
          1: { unlocked: true, hwSubmitted: false, hwStatus: 'not_started' },
          2: { unlocked: false, hwSubmitted: false, hwStatus: 'not_started' },
          3: { unlocked: false, hwSubmitted: false, hwStatus: 'not_started' }
        },
        updatedAt: new Date().toISOString()
      };
      progressList.push(progress);
      saveLocalProgress(progressList);
    }

    return { user: activeUser, progress };
  } else {
    // ACTUAL SUPABASE INTEGRATION
    // 1. Fetch user
    let queryFilter = `telegram.ilike.${normInput}`;
    if (digitsOnly) {
      queryFilter += `,phone.eq.${digitsOnly}`;
    }

    let { data: user, error } = await supabase!
      .from('minicourse_users')
      .select('*')
      .or(queryFilter)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      throw new Error("Вхід заборонено. Користувача не знайдено. Будь ласка, придбайте практикум на головній сторінці.");
    }

    if (user.role === 'student') {
      if (!user.is_paid) {
        throw new Error("Практикум ще не сплачено. Оплатіть участь на головній сторінці для отримання доступу.");
      }
      if (user.status === 'under_investigation') {
        throw new Error("Доступ заблоковано. Зафіксовано вхід з великої кількості пристроїв. Будь ласка, зверніться в підтримку.");
      }

      if (deviceUuid) {
        const uuids: string[] = user.device_uuids || [];
        if (!uuids.includes(deviceUuid)) {
          const newUuids = [...uuids, deviceUuid];
          if (uuids.length >= 4) {
            const { error: blockErr } = await supabase!
              .from('minicourse_users')
              .update({
                status: 'under_investigation',
                device_uuids: newUuids
              })
              .eq('id', user.id);
            
            if (blockErr) throw blockErr;
            throw new Error("Доступ заблоковано. Зафіксовано вхід з 5 унікальних пристроїв. Зверніться до підтримки.");
          } else {
            const { error: updateErr } = await supabase!
              .from('minicourse_users')
              .update({
                device_uuids: newUuids
              })
              .eq('id', user.id);
            
            if (updateErr) throw updateErr;
            user.device_uuids = newUuids;
          }
        }
      }
    }

    // 2. Fetch or create progress
    let { data: progress, error: progError } = await supabase!
      .from('minicourse_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (progError) throw progError;

    if (!progress) {
      const defaultLessons = {
        1: { unlocked: true, hwSubmitted: false, hwStatus: 'not_started' },
        2: { unlocked: false, hwSubmitted: false, hwStatus: 'not_started' },
        3: { unlocked: false, hwSubmitted: false, hwStatus: 'not_started' }
      };

      const { data: newProg, error: createProgErr } = await supabase!
        .from('minicourse_progress')
        .insert({
          user_id: user.id,
          progress_percent: 0,
          lessons: defaultLessons
        })
        .select()
        .single();
      
      if (createProgErr) throw createProgErr;
      progress = newProg;
    }

    // Map database fields to application types
    const appProgress: MinicourseProgress = {
      id: progress.id,
      userId: progress.user_id,
      progressPercent: progress.progress_percent,
      lessons: progress.lessons,
      updatedAt: progress.updated_at
    };

    return { user: user as MinicourseUser, progress: appProgress };
  }
}

export async function getProfile(userId: string): Promise<MinicourseUser | null> {
  if (IS_MOCK_MODE) {
    const users = getLocalUsers();
    return users.find(u => u.id === userId) || null;
  } else {
    const { data, error } = await supabase!
      .from('minicourse_users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as MinicourseUser;
  }
}

export async function getProgress(userId: string): Promise<MinicourseProgress | null> {
  if (IS_MOCK_MODE) {
    const progressList = getLocalProgress();
    return progressList.find(p => p.userId === userId) || null;
  } else {
    const { data, error } = await supabase!
      .from('minicourse_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return {
      id: data.id,
      userId: data.user_id,
      progressPercent: data.progress_percent,
      lessons: data.lessons,
      updatedAt: data.updated_at
    };
  }
}

export async function updateProgress(userId: string, lessonId: 1 | 2 | 3, updates: Partial<LessonProgress>): Promise<MinicourseProgress> {
  if (IS_MOCK_MODE) {
    const progressList = getLocalProgress();
    const idx = progressList.findIndex(p => p.userId === userId);
    if (idx === -1) throw new Error("Progress record not found");

    const record = progressList[idx];
    record.lessons[lessonId] = {
      ...record.lessons[lessonId],
      ...updates
    };

    // Calculate progression
    record.progressPercent = calculateProgressPercent(record.lessons);
    record.updatedAt = new Date().toISOString();

    progressList[idx] = record;
    saveLocalProgress(progressList);
    return record;
  } else {
    // Read existing
    const current = await getProgress(userId);
    if (!current) throw new Error("Progress not found");

    const updatedLessons = {
      ...current.lessons,
      [lessonId]: {
        ...current.lessons[lessonId],
        ...updates
      }
    };

    const newPercent = calculateProgressPercent(updatedLessons);

    const { data, error } = await supabase!
      .from('minicourse_progress')
      .update({
        lessons: updatedLessons,
        progress_percent: newPercent,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      progressPercent: data.progress_percent,
      lessons: data.lessons,
      updatedAt: data.updated_at
    };
  }
}

export function maskTelegram(tg: string): string {
  const clean = tg.replace(/^@/, '');
  if (!clean) return '';
  if (clean.length <= 3) {
    return '@' + clean[0] + '*'.repeat(clean.length - 1);
  }
  return '@' + clean.slice(0, 3) + '***' + clean.slice(-2);
}

export interface StudentLeaderboardEntry {
  id: string;
  name: string;
  telegram?: string;
  progressPercent: number;
}

export async function getLeaderboard(currentUserId?: string): Promise<StudentLeaderboardEntry[]> {
  if (IS_MOCK_MODE) {
    const users = getLocalUsers().filter(u => u.role === 'student');
    const progressList = getLocalProgress();
    
    return users.map(user => {
      const prog = progressList.find(p => p.userId === user.id);
      const isSelf = user.id === currentUserId;
      return {
        id: user.id,
        name: user.name,
        telegram: isSelf ? user.telegram : undefined,
        progressPercent: prog ? prog.progressPercent : 0
      };
    }).sort((a, b) => b.progressPercent - a.progressPercent);
  } else {
    // Join logic in supabase or via dual query
    const { data: users, error: uErr } = await supabase!
      .from('minicourse_users')
      .select('id, name, telegram')
      .eq('role', 'student');
    
    if (uErr) throw uErr;

    const { data: progress, error: pErr } = await supabase!
      .from('minicourse_progress')
      .select('user_id, progress_percent');

    if (pErr) throw pErr;

    return users.map(u => {
      const prog = progress.find(p => p.user_id === u.id);
      const isSelf = u.id === currentUserId;
      return {
        id: u.id,
        name: u.name,
        telegram: isSelf ? (u.telegram || undefined) : undefined,
        progressPercent: prog ? prog.progress_percent : 0
      };
    }).sort((a, b) => b.progressPercent - a.progressPercent);
  }
}

export interface AdminSubmissionItem {
  userId: string;
  userName: string;
  userEmail: string;
  userTelegram?: string;
  lessonId: 1 | 2 | 3;
  hwUrl: string;
  hwStatus: HomeworkStatus;
  hwSubmittedAt: string;
  hwComment?: string;
}

export async function getAdminSubmissions(): Promise<AdminSubmissionItem[]> {
  if (IS_MOCK_MODE) {
    const users = getLocalUsers().filter(u => u.role === 'student');
    const progressList = getLocalProgress();
    const items: AdminSubmissionItem[] = [];

    users.forEach(user => {
      const prog = progressList.find(p => p.userId === user.id);
      if (!prog) return;

      ([1, 2, 3] as const).forEach(lessonId => {
        const lesson = prog.lessons[lessonId];
        if (lesson && lesson.hwSubmitted && lesson.hwUrl) {
          items.push({
            userId: user.id,
            userName: user.name,
            userEmail: user.email || '',
            userTelegram: user.telegram,
            lessonId,
            hwUrl: lesson.hwUrl,
            hwStatus: lesson.hwStatus,
            hwSubmittedAt: lesson.hwSubmittedAt || new Date().toISOString(),
            hwComment: lesson.hwComment
          });
        }
      });
    });

    return items.sort((a, b) => new Date(b.hwSubmittedAt).getTime() - new Date(a.hwSubmittedAt).getTime());
  } else {
    const { data: users, error: uErr } = await supabase!
      .from('minicourse_users')
      .select('id, name, email, telegram')
      .eq('role', 'student');
    
    if (uErr) throw uErr;

    const { data: progress, error: pErr } = await supabase!
      .from('minicourse_progress')
      .select('user_id, lessons');
    
    if (pErr) throw pErr;

    const items: AdminSubmissionItem[] = [];
    users.forEach(u => {
      const prog = progress.find(p => p.user_id === u.id);
      if (!prog || !prog.lessons) return;

      ([1, 2, 3] as const).forEach(lessonId => {
        const lesson = prog.lessons[lessonId] as LessonProgress | undefined;
        if (lesson && lesson.hwSubmitted && lesson.hwUrl) {
          items.push({
            userId: u.id,
            userName: u.name,
            userEmail: u.email || '',
            userTelegram: u.telegram || undefined,
            lessonId,
            hwUrl: lesson.hwUrl,
            hwStatus: lesson.hwStatus,
            hwSubmittedAt: lesson.hwSubmittedAt || new Date().toISOString(),
            hwComment: lesson.hwComment
          });
        }
      });
    });

    return items.sort((a, b) => new Date(b.hwSubmittedAt).getTime() - new Date(a.hwSubmittedAt).getTime());
  }
}

export async function saveHomeworkReview(userId: string, lessonId: 1 | 2 | 3, status: HomeworkStatus, comment: string): Promise<MinicourseProgress> {
  const updates: Partial<LessonProgress> = {
    hwStatus: status,
    hwComment: comment
  };

  // If homework is approved, unlock the NEXT lesson!
  const progress = await getProgress(userId);
  if (!progress) throw new Error("Progress record not found");

  const nextLessonId = (lessonId + 1) as 2 | 3;
  
  if (status === 'accepted') {
    // Unlock next lesson
    if (lessonId < 3) {
      await updateProgress(userId, nextLessonId, { unlocked: true });
    }
  }

  return await updateProgress(userId, lessonId, updates);
}

export async function deleteStudentUser(userId: string): Promise<boolean> {
  if (IS_MOCK_MODE) {
    const users = getLocalUsers();
    const progressList = getLocalProgress();

    const filteredUsers = users.filter(u => u.id !== userId);
    const filteredProgress = progressList.filter(p => p.userId !== userId);

    saveLocalUsers(filteredUsers);
    saveLocalProgress(filteredProgress);
    return true;
  } else {
    // 1. Delete progress
    const { error: pErr } = await supabase!
      .from('minicourse_progress')
      .delete()
      .eq('user_id', userId);
    if (pErr) throw pErr;

    // 2. Delete user
    const { error: uErr } = await supabase!
      .from('minicourse_users')
      .delete()
      .eq('id', userId);
    if (uErr) throw uErr;

    return true;
  }
}

export async function getLessonsConfig(): Promise<MinicourseLessonConfig[]> {
  if (IS_MOCK_MODE) {
    return getLocalLessonsConfig();
  } else {
    const { data, error } = await supabase!
      .from('minicourse_lessons_config')
      .select('*')
      .order('lesson_id', { ascending: true });

    if (error) {
      console.warn("Table minicourse_lessons_config may not exist, falling back to defaults. Error:", error);
      return DEFAULT_LESSONS_CONFIG;
    }

    if (!data || data.length === 0) {
      // Seed table
      const { error: seedError } = await supabase!
        .from('minicourse_lessons_config')
        .insert(DEFAULT_LESSONS_CONFIG.map(cfg => ({
          lesson_id: cfg.lesson_id,
          title: cfg.title,
          description: cfg.description,
          youtube_id: cfg.youtube_id,
          mindmap_url: cfg.mindmap_url,
          hw_spreadsheet_url: cfg.hw_spreadsheet_url,
          notion_url: cfg.notion_url,
          hw_instructions: cfg.hw_instructions,
          bonus_video_title: cfg.bonus_video_title,
          bonus_video_youtube_id: cfg.bonus_video_youtube_id,
          updated_at: new Date().toISOString()
        })));
      if (seedError) {
        console.error("Error seeding minicourse_lessons_config:", seedError);
        return DEFAULT_LESSONS_CONFIG;
      }
      return DEFAULT_LESSONS_CONFIG;
    }

    return data.map(item => ({
      lesson_id: item.lesson_id,
      title: item.title,
      description: item.description,
      youtube_id: item.youtube_id,
      mindmap_url: item.mindmap_url,
      hw_spreadsheet_url: item.hw_spreadsheet_url,
      notion_url: item.notion_url,
      hw_instructions: item.hw_instructions,
      bonus_video_title: item.bonus_video_title,
      bonus_video_youtube_id: item.bonus_video_youtube_id,
      updated_at: item.updated_at
    }));
  }
}

export async function updateLessonConfig(lessonId: number, updates: Partial<MinicourseLessonConfig>): Promise<MinicourseLessonConfig> {
  if (IS_MOCK_MODE) {
    const config = getLocalLessonsConfig();
    const idx = config.findIndex(c => c.lesson_id === lessonId);
    if (idx === -1) throw new Error("Lesson config not found");

    const updated = {
      ...config[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    config[idx] = updated;
    saveLocalLessonsConfig(config);
    return updated;
  } else {
    const { data, error } = await supabase!
      .from('minicourse_lessons_config')
      .update({
        title: updates.title,
        description: updates.description,
        youtube_id: updates.youtube_id,
        mindmap_url: updates.mindmap_url,
        hw_spreadsheet_url: updates.hw_spreadsheet_url,
        notion_url: updates.notion_url,
        hw_instructions: updates.hw_instructions,
        bonus_video_title: updates.bonus_video_title,
        bonus_video_youtube_id: updates.bonus_video_youtube_id,
        updated_at: new Date().toISOString()
      })
      .eq('lesson_id', lessonId)
      .select()
      .single();

    if (error) {
      // If update fails, try to upsert
      const { data: upsertData, error: upsertErr } = await supabase!
        .from('minicourse_lessons_config')
        .upsert({
          lesson_id: lessonId,
          title: updates.title,
          description: updates.description,
          youtube_id: updates.youtube_id,
          mindmap_url: updates.mindmap_url,
          hw_spreadsheet_url: updates.hw_spreadsheet_url,
          notion_url: updates.notion_url,
          hw_instructions: updates.hw_instructions,
          bonus_video_title: updates.bonus_video_title,
          bonus_video_youtube_id: updates.bonus_video_youtube_id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (upsertErr) throw upsertErr;
      return upsertData as any as MinicourseLessonConfig;
    }

    return data as any as MinicourseLessonConfig;
  }
}

export async function getAllStudents(): Promise<MinicourseUser[]> {
  if (IS_MOCK_MODE) {
    return getLocalUsers().filter(u => u.role === 'student');
  } else {
    const { data, error } = await supabase!
      .from('minicourse_users')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as MinicourseUser[];
  }
}

export async function toggleUserLockout(userId: string, shouldBlock: boolean): Promise<MinicourseUser> {
  const newStatus = shouldBlock ? 'under_investigation' : 'active';
  if (IS_MOCK_MODE) {
    const users = getLocalUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error("User not found");

    users[idx].status = newStatus;
    if (!shouldBlock) {
      users[idx].device_uuids = []; // Reset device list when unblocking
    }
    saveLocalUsers(users);
    return users[idx];
  } else {
    const { data, error } = await supabase!
      .from('minicourse_users')
      .update({
        status: newStatus,
        device_uuids: shouldBlock ? undefined : [] // Reset devices when unblocking
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as MinicourseUser;
  }
}

export async function uploadHomeworkFile(file: File, userId: string, lessonId: number): Promise<string> {
  if (IS_MOCK_MODE) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/lesson-${lessonId}-${Date.now()}.${fileExt}`;
  const bucketName = 'homeworks';

  try {
    await supabase!.storage.createBucket(bucketName, { public: true });
  } catch (err) {
    // Ignore error if already exists
  }

  const { data, error } = await supabase!.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Supabase upload error, falling back to base64:', error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const { data: { publicUrl } } = supabase!.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return publicUrl;
}
