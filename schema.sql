-- SQL Schema Setup for Sofia Mini-Course Platform
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/qhhfdjfojqeolckwynft/sql)

-- 1. Create minicourse_users Table
CREATE TABLE IF NOT EXISTS public.minicourse_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    telegram TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'student',
    is_paid BOOLEAN NOT NULL DEFAULT false,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    device_uuids TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create minicourse_progress Table
CREATE TABLE IF NOT EXISTS public.minicourse_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.minicourse_users(id) ON DELETE CASCADE UNIQUE,
    progress_percent INTEGER NOT NULL DEFAULT 0,
    lessons JSONB NOT NULL DEFAULT '{"1":{"unlocked":true,"hwSubmitted":false,"hwStatus":"not_started"},"2":{"unlocked":false,"hwSubmitted":false,"hwStatus":"not_started"},"3":{"unlocked":false,"hwSubmitted":false,"hwStatus":"not_started"}}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create minicourse_lessons_config Table
CREATE TABLE IF NOT EXISTS public.minicourse_lessons_config (
    lesson_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    youtube_id TEXT NOT NULL,
    mindmap_url TEXT,
    hw_spreadsheet_url TEXT,
    notion_url TEXT,
    hw_instructions TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Disable RLS to allow seamless Anon/Public client operations matching your codebase
ALTER TABLE public.minicourse_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.minicourse_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.minicourse_lessons_config DISABLE ROW LEVEL SECURITY;

-- 5. Seed default Admin users (if they don't already exist)
INSERT INTO public.minicourse_users (id, name, email, telegram, role, is_paid, payment_status, status)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Адміністратор Owner (Софія)', 'sofifinsight@finsight.com', 'sofifinsight', 'admin', true, 'paid', 'active'),
    ('00000000-0000-0000-0000-000000000002', 'Адміністратор YuransiS', 'yuransis@finsight.com', 'yuransis', 'admin', true, 'paid', 'active'),
    ('00000000-0000-0000-0000-000000000003', 'Адміністратор JeniaProop', 'jeniaproop@finsight.com', 'jeniaproop', 'admin', true, 'paid', 'active')
ON CONFLICT (telegram) DO UPDATE 
SET role = 'admin', is_paid = true, payment_status = 'paid', status = 'active';

-- 6. Seed default Lesson Configurations (if they don't already exist)
INSERT INTO public.minicourse_lessons_config (lesson_id, title, description, youtube_id, mindmap_url, hw_spreadsheet_url, notion_url, hw_instructions)
VALUES 
    (
        1, 
        'Перший ефір', 
        'Створення першого інвестиційного плану', 
        'SnyxALmvvnE', 
        'https://mm.tt/map/3978357799?t=cIsPiI7Jsq', 
        'https://docs.google.com/spreadsheets/d/1xptWzJrSQ8aW2pOyuWpSH7P-4_tOJ6i04iB2-roF9kw/edit?usp=sharing', 
        NULL,
        E'ВАЖЛИВО! Починаємо роботу лише в скопійованій таблиці!\n\nЗробіть копію таблиці за посиланням нижче.\n\nЗаповніть її за відповідними критеріями відповідно до ефіру.\n\nПісля заповнення таблиці відкрийте доступ «всім, у кого є посилання».\n\nНадішліть посилання у вікно праворуч для перевірки.'
    ),
    (
        2, 
        'Другий ефір', 
        'Робота з капіталом та брокерськими рахунками', 
        'l4p1F9oy3ko', 
        'https://mm.tt/map/3979303280?t=HfkclCi41H', 
        'https://docs.google.com/spreadsheets/d/1UhFeWJyezb4W_t5jkesOvjiAe6l5SNDf/edit?gid=1880085387#gid=1880085387', 
        NULL,
        E'! ВАЖЛИВО! Працюємо лише в скопійованій таблиці.\n\nЗробіть копію таблиці за посиланням нижче.\n\nВаше завдання — заповнити таблицю відповідно до критеріїв.\n\nПісля виконання відкрийте доступ «всім, у кого є посилання».\n\nНадішліть посилання на перевірку.'
    ),
    (
        3, 
        'Третій ефір', 
        'Купівля першої акції та диверсифікація', 
        '-p6u77YkyCw', 
        'https://mm.tt/map/3663819169?t=B79jLpx0HT', 
        NULL, 
        'https://soapy-floss-c69.notion.site/33f9215c3f2180cf93e7e4f3bc7527d4',
        E'Виконайте фінальні кроки для завершення курсу:\n\nПройдіть тест і визначте свій ризик-профіль в інвестиціях.\n\nВідкрийте 2 брокерські рахунки (InteractiveBrokers та Freedom Finance Europe).\n\nПоповніть свій рахунок (сума будь-яка). Для розіграшу акцій від 100€.\n\nНадішліть скрін купленої вашої першої акції.'
    )
ON CONFLICT (lesson_id) DO NOTHING;
