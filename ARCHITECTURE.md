# Architecture & Live Map: CRM Economica / Sofia Platform

This document describes the project structure, routing, data schema, and key components.

---

## 1. Project Overview & Stack
- **Core Stack:** Next.js (App Router, React 19, TypeScript), Tailwind CSS, Framer Motion, Supabase (PostgreSQL).
- **Hosting / Deploy:** Vercel.
- **Database / Storage:** Supabase Database (secured with strict Row Level Security; leads table allows only INSERT for anonymous users, other tables block anonymous access completely), Supabase Storage for files.
- **Integrations:** Google Sheets API via Google Apps Script (GAS Webhooks).

---

## 2. Directory Structure & App Map

```
economica/
├── schema.sql                     # Database schema definitions and seed data
├── ARCHITECTURE.md                # [LIVING DOCUMENT] Living map of project architecture
├── implemented.md                 # Deep technical analysis of the CRM architecture
├── package.json                   # Dependency definitions
├── public/                        # Static assets
└── src/
    ├── app/
    │   ├── admin/                 # Main Admin CRM panel (Google Sheets integrated)
    │   ├── api/                   # API Routes (Analytics, WayForPay, Web Lead, etc.)
    │   ├── intensive/             # Free Intensive landing page with custom copywriting
    │   ├── minicourse/            # Sofia Minicourse Platform
    │   │   ├── admin/             # Minicourse Admin panel (submissions, configs)
    │   │   ├── lessons/           # Individual lesson pages (video player, HW submission)
    │   │   ├── login/             # User and admin authentication pages
    │   │   ├── supabase.ts        # Database operations & mock mode fallback
    │   │   ├── types.ts           # Shared TypeScript interfaces
    │   │   └── useAuth.ts         # Authentication context and helper hooks
    │   ├── page.tsx               # Landing page for Minicourse / Main Portal
    │   └── globals.css            # Stylesheets
    ├── components/                # Reusable UI components
    └── hooks/                     # Custom React hooks
```

---

## 3. Database Schema (Supabase)

### Table: `public.minicourse_users`
- **id:** `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **name:** `TEXT NOT NULL`
- **email:** `TEXT` (optional, for backward compatibility)
- **telegram:** `TEXT UNIQUE NOT NULL`
- **telegram_chat_id:** `BIGINT UNIQUE` (authentic ID verified via Telegram Login Widget or bot pairing)
- **phone:** `TEXT`
- **role:** `TEXT NOT NULL DEFAULT 'student'` ('student' | 'admin')
- **is_paid:** `BOOLEAN NOT NULL DEFAULT false`
- **payment_status:** `TEXT NOT NULL DEFAULT 'pending'`
- **device_uuids:** `TEXT[] DEFAULT '{}'` (anti-fraud system, limits up to 4 devices)
- **status:** `TEXT NOT NULL DEFAULT 'active'` ('active' | 'under_investigation')
- **created_at:** `TIMESTAMPTZ NOT NULL DEFAULT now()`
- **terms_accepted:** `BOOLEAN NOT NULL DEFAULT false` (indicates student agreed to course terms)

### Table: `public.minicourse_progress`
- **id:** `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- **user_id:** `UUID NOT NULL REFERENCES public.minicourse_users(id) ON DELETE CASCADE UNIQUE`
- **progress_percent:** `INTEGER NOT NULL DEFAULT 0`
- **lessons:** `JSONB NOT NULL` (maps status of lessons 1, 2, 3: `unlocked`, `openedAt`, `hwSubmitted`, `hwUrl`, `hwStatus` ('not_started' | 'pending' | 'accepted' | 'needs_improvement' | 'expired_not_submitted'), `hwComment`, `hwSubmittedAt`, `reminderSent`, `videoWatchedSec`, `videoDurationSec`, `videoCompleted`, `videoCompletedAt`)
- **updated_at:** `TIMESTAMPTZ NOT NULL DEFAULT now()`

### Table: `public.minicourse_lessons_config`
- **lesson_id:** `INTEGER PRIMARY KEY`
- **title:** `TEXT NOT NULL`
- **description:** `TEXT NOT NULL`
- **youtube_id:** `TEXT NOT NULL`
- **mindmap_url:** `TEXT`
- **hw_spreadsheet_url:** `TEXT`
- **notion_url:** `TEXT`
- **hw_instructions:** `TEXT NOT NULL`
- **updated_at:** `TIMESTAMPTZ NOT NULL DEFAULT now()`

---

## 4. Security & Anti-Spoofing
- **Telegram Isolation (Leaderboard):** To prevent identity spoofing (since login relies on Telegram username), the `getLeaderboard(currentUserId)` API completely strips the Telegram handles of all other students (`telegram: undefined`). Only the currently logged-in student will see their own Telegram handle on the leaderboard.
- **Minicourse Login Options:** Supports both dynamic one-click widget login (verifying secure signatures via `/api/minicourse/telegram-auth`) and a manual fallback input form where students enter their Telegram handle (checked via the server-side `loginUser` Server Action to ensure secure execution and bypass RLS).
- **Anti-Fraud System (Device Limit):** Limits each user to a maximum of 4 unique devices (`device_uuids`). A 5th device triggers `under_investigation` status and blocks access.
- **Admin Access Control:** CRM and Minicourse administration access are secured via pre-configured admin credentials. The CRM uses standard HTTP-only session cookies validated in the Next.js middleware, while the Minicourse uses credentials mirrored both in database user roles (`admin` role in `minicourse_users`) and secure login routes.
- **Row Level Security (RLS) & Server Actions:** All Supabase tables (`leads`, `minicourse_users`, `minicourse_progress`, `minicourse_lessons_config`, `minicourse_autologin_tokens`) have RLS enabled. Anonymous public access is blocked for all operations on minicourse tables. The `leads` table permits only public `INSERT` (for client lead form submissions via server-side endpoints). All client components retrieve and mutate minicourse data via Next.js Server Actions (`actions.ts`) executing securely on the server with the service role key, bypassing RLS.

---

## 5. Сквозная Аналитика & Путь Клиента (Customer Journey)
- **Анонимные визиты:** При каждом переходе (`log_traffic`) анонимный пользователь регистрируется в сводной таблице `Аналітика Ліди` со статусом `Анонім` и его `Visitor ID`. Это позволяет видеть посещения до того, как оставлена заявка.
- **Link & Merge (Автоматическое склеивание):**
  - При регистрации лида на любом из сайтов происходит поиск по **телефону** (сравнение последних 9 цифр) или **Telegram**. Если совпадение найдено, строка обновляется, привязывается новый `Visitor ID` (для связывания разных устройств), а пути визитов склеиваются в поле `Customer Journey`.
  - Если по контактам не найдено, поиск идет по **`Visitor ID`** для обновления анонимного профиля, созданного ранее при заходе.
  - Если совпадений нет — создается новая запись.
- **Динамические чекбоксы сайтов:** Скрипт в Google Sheets автоматически создает колонки `Заходив на [Site]` и `Зареєстрований на [Site]` при обнаружении посещений или регистраций с новых путей и форм.
- **Двусторонняя синхронизация (Dual-Write):** Next.js дублирует все анонимные заходы и регистрации в Supabase таблицу `leads` в реальном времени по той же логике Link & Merge.
- **Оптимизация производительности (Background Execution):** Чтобы исключить задержки на клиенте из-за медленных внешних запросов (таких как API Google Sheets или запись в БД), Next.js API маршруты (`/api/web-lead` и `/api/lead`) используют встроенный API `after()` из `next/server`. Это позволяет немедленно отдать ответ клиенту и перенаправить его, выполняя запись в Google Sheets и Supabase в фоновом режиме.

---

## 6. Free Intensive Registration Flow (/intensive)
- **Direct Access Activation:** Because registration for the intensive program is free, submitting the form at `/intensive` bypasses payment gateways completely.
- **Instant Status Update:** The backend `/api/lead` registers the user directly in `minicourse_users` with `is_paid = true` and `payment_status = 'paid'`, granting immediate access.
- **Analytics & Sheets Sync:** Google Sheets webhook is updated instantly to mark the lead as `Оплачено`, while B&W Analytics Gateway registers the conversion with `status = 'closed_won'` and `amount = 0`.
- **Client Redirection:** To ensure a frictionless user experience and prevent payment-checking page errors, the client is redirected directly to the Telegram bot (`https://t.me/SofiaFeduniak_bot?start=6a22e052a6453da635042cc6`) with a 500ms delay to allow Facebook Pixel tracking to complete.

---

## 7. Homework Confirmation & Reminders
- **Submission Notification (`hw_submitted`):** When a student submits homework in the lesson interface, the client calls `/api/minicourse/bot/notify` with message type `'hw_submitted'`. This triggers a Telegram bot message thanking the student and confirming that the curator is reviewing their homework (normally within 24 hours).
- **Event-Driven QStash Reminders:**
  - **Scheduling (`/api/homework/assign`):** When a lesson is first opened by a student, the client schedules a deadline reminder via Upstash QStash. The dispatch is delayed by `Upstash-Not-Before` header to trigger exactly 3 hours before the 24-hour deadline (21 hours from opening).
  - **Cancellation (`/api/homework/cancel-reminder`):** If a student submits their homework before the reminder fires, a cancel request is made to remove the message from the QStash queue by its `qstashMsgId` and set its status to `cancelled` in Supabase.
  - **Delivery Webhook (`/api/notifications/send`):** QStash invokes this endpoint to trigger the reminder. The signature is validated using the `@upstash/qstash` SDK. The route checks Supabase progress first: if the homework has already been submitted, the delivery is skipped; otherwise, the Telegram Bot API sends the reminder message, and the notification status is set to `sent`.
  - **Rejections/Rescheduling:** If a curator rejects a homework submission (`needs_improvement`), the admin dashboard triggers a fresh 24-hour assign/rescheduling operation to give the student another reminder window. If accepted (`accepted`), the reminder is permanently cancelled.




