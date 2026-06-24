import { NextResponse } from 'next/server';
import { supabase } from '@/app/minicourse/supabase';
import crypto from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export async function POST(req: Request) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Telegram Bot Token is not configured' }, { status: 500 });
    }

    const payload = await req.json();

    // Check if this is a standard text message
    if (!payload.message || !payload.message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = payload.message.chat.id;
    const text = payload.message.text.trim();
    const username = payload.message.from.username || '';
    const firstName = payload.message.from.first_name || 'Учасник';

    // Check for the start command: /start pay_[phone_or_order]
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const startParam = parts.length > 1 ? parts[1] : '';

      if (startParam.startsWith('pay_')) {
        const token = startParam.substring(4); // Extract order_id or phone
        
        if (supabase) {
          let user = null;
          let phoneToMatch = null;
          let leadName = 'Учасник';
          let leadIdToUpdate = null;

          // 1. If token is phone number, match directly
          const isPhone = /^\d+$/.test(token);
          if (isPhone) {
            phoneToMatch = token;
          } else {
            // 2. Otherwise, look up the lead by order_id
            const { data: leadData } = await supabase
              .from('leads')
              .select('*')
              .eq('order_id', token)
              .maybeSingle();

            if (leadData) {
              phoneToMatch = leadData.phone;
              leadName = leadData.name || 'Учасник';
              if (token.startsWith('gift_')) {
                leadIdToUpdate = leadData.id;
              }
            }
          }

          if (phoneToMatch) {
            const phoneClean = phoneToMatch.trim().replace(/\D/g, '');
            let { data: existingUser } = await supabase
              .from('minicourse_users')
              .select('*')
              .eq('phone', phoneClean)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (!existingUser && username) {
              const cleanUsername = username.trim().replace(/^@/, '');
              const { data: byUsername } = await supabase
                .from('minicourse_users')
                .select('*')
                .ilike('telegram', cleanUsername)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
              existingUser = byUsername;
            }

            if (existingUser) {
              // Update existing user, mark paid, set access open time
              const { data: updatedUser } = await supabase
                .from('minicourse_users')
                .update({
                  telegram: username || existingUser.telegram,
                  telegram_chat_id: chatId,
                  is_paid: true,
                  payment_status: 'paid',
                  access_opened_at: existingUser.access_opened_at || new Date().toISOString()
                })
                .eq('id', existingUser.id)
                .select()
                .single();
              
              user = updatedUser;
            } else {
              // Register new user on the fly
              const { data: newUser } = await supabase
                .from('minicourse_users')
                .insert({
                  name: leadName,
                  email: `${phoneClean}@economica.edu`,
                  phone: phoneClean,
                  role: 'student',
                  is_paid: true,
                  payment_status: 'paid',
                  access_opened_at: new Date().toISOString(),
                  telegram: username || null,
                  telegram_chat_id: chatId,
                  status: 'active'
                })
                .select()
                .single();
              
              user = newUser;
            }
          }

          if (user) {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sofifinsight.vercel.app';
            
            // Generate a secure one-time login token
            const tokenUuid = crypto.randomUUID();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            
            const { error: tokenInsertErr } = await supabase
              .from('minicourse_autologin_tokens')
              .insert({
                token: tokenUuid,
                user_id: user.id,
                expires_at: expiresAt,
                is_used: false
              });
            
            if (tokenInsertErr) {
              console.error('[Bot Webhook] Failed to insert autologin token:', tokenInsertErr);
            }

            // If it's a gift token, mark it as used by changing order_id to used_gift_...
            if (leadIdToUpdate && token.startsWith('gift_')) {
              const { error: updateLeadErr } = await supabase
                .from('leads')
                .update({ order_id: `used_${token}` })
                .eq('id', leadIdToUpdate);
              
              if (updateLeadErr) {
                console.error('[Bot Webhook] Failed to invalidate gift token:', updateLeadErr);
              } else {
                console.log(`[Bot Webhook] Gift token ${token} successfully marked as used.`);
              }
            }

            const autologinUrl = `${siteUrl}/minicourse/login?token=${tokenUuid}&redirect=${encodeURIComponent('/minicourse/lessons/1')}`;

            // Send successful activation notification message (Message 1: Onboarding Link)
            const welcomeText = `Дякуємо за купівлю! 🎉\n\nВітаємо на курсі, ${firstName}! Ваш доступ до кабінету міні-курсу успешно активовано. Я — Ваш особистий Telegram-помічник, де Ви будете отримувати нагадування та результати перевірки домашніх завдань.\n\n👉 Почніть навчання за кнопкою нижче:`;
            
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: welcomeText,
                parse_mode: 'Markdown',
                protect_content: true,
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: '👉 Почати навчання (Урок 1)',
                        url: autologinUrl
                      }
                    ]
                  ]
                }
              })
            });

            // Message 2: Warning Message
            const warningText = `⚠️ *Зверніть увагу!*\n\nДоступ до міні-курсу відкрито на 2 тижні. Перевірка зі зворотнім зв’язком від куратора доступна протягом 7 днів.\n\nТому не відкладайте перегляд уроків та починайте прямо зараз!`;
            
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: warningText,
                parse_mode: 'Markdown',
                protect_content: true
              })
            });

            return NextResponse.json({ ok: true });
          } else {
            // User not found and could not be linked (e.g. order not found)
            const notFoundText = `⚠️ *Замовлення не знайдено.*\n\nШановний(а) ${firstName}, ми не змогли знайти оплату за цим посиланням. Будь ласка, переконайтеся, що оплату завершено.\n\nЯкщо виникли запитання, зверніться в підтримку: @YuransiS`;
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: notFoundText,
                parse_mode: 'Markdown',
                protect_content: true
              })
            });
            return NextResponse.json({ ok: true });
          }
        }
      }

      if (supabase) {
        try {
          let linkedUser = null;
          const { data: byChatId } = await supabase
            .from('minicourse_users')
            .select('*')
            .eq('telegram_chat_id', chatId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (byChatId) {
            linkedUser = byChatId;
          } else if (username) {
            const cleanUsername = username.trim().replace(/^@/, '');
            const { data: byUsername } = await supabase
              .from('minicourse_users')
              .select('*')
              .ilike('telegram', cleanUsername)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (byUsername) {
              const { data: updatedUser } = await supabase
                .from('minicourse_users')
                .update({ telegram_chat_id: chatId })
                .eq('id', byUsername.id)
                .select()
                .single();
              
              linkedUser = updatedUser;
            }
          }

          if (linkedUser) {
            if (linkedUser.role === 'student' && !linkedUser.is_paid) {
              const unpaidText = `⚠️ *Оплата не підтверджена.*\n\nШановний(а) ${firstName}, оплату за Вашою участю в практикумі ще не підтверджено платіжною системою. Будь ласка, завершіть оплату на нашому сайті для активації доступу.\n\nЯкщо у Вас виникли питання чи проблеми з доступом, зверніться до нашої техпідтримки: @YuransiS`;
              await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: unpaidText,
                  parse_mode: 'Markdown',
                  protect_content: true
                })
              });
              return NextResponse.json({ ok: true });
            }

            // Enforce 14-day limit
            const accessStart = linkedUser.access_opened_at || linkedUser.created_at;
            const elapsedDays = (Date.now() - new Date(accessStart).getTime()) / (1000 * 60 * 60 * 24);
            if (linkedUser.role === 'student' && elapsedDays > 14) {
              const expiredText = `⏳ *Термін дії доступу закінчився.*\n\nШановний(а) ${firstName}, термін дії Вашого доступу до міні-курсу закінчився (доступ надається на 14 днів з моменту оплати).\n\nЯкщо у Вас виникли питання, зверніться до підтримки: @YuransiS`;
              await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: expiredText,
                  parse_mode: 'Markdown',
                  protect_content: true
                })
              });
              return NextResponse.json({ ok: true });
            }

            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sofifinsight.vercel.app';
            
            // Generate a secure one-time login token for welcome back
            const tokenUuid = crypto.randomUUID();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            
            const { error: tokenInsertErr } = await supabase
              .from('minicourse_autologin_tokens')
              .insert({
                token: tokenUuid,
                user_id: linkedUser.id,
                expires_at: expiresAt,
                is_used: false
              });
            
            if (tokenInsertErr) {
              console.error('[Bot Webhook] Failed to insert welcome back token:', tokenInsertErr);
            }

            const autologinUrl = `${siteUrl}/minicourse/login?token=${tokenUuid}&redirect=${encodeURIComponent('/minicourse')}`;

            const welcomeBackText = `Вітаємо, ${firstName}! 👋\n\nРаді бачити Вас знову. Ви можете увійти у свій кабінет практикуму за кнопкою нижче (авторизація відбудеться автоматично):`;
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: welcomeBackText,
                protect_content: true,
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: '🌐 Увійти в кабінет',
                        url: autologinUrl
                      }
                    ]
                  ]
                }
              })
            });
            return NextResponse.json({ ok: true });
          }
        } catch (err) {
          console.error('[Bot Webhook] Error looking up linked user on fallback:', err);
        }
      }

      // Default welcome fallback if start param doesn't match or user not found
      const defaultWelcome = `Вітаємо, ${firstName}! 👋\n\nЯ ваш персональний помічник на міні-курсі Софії.\n\nЯкщо Ви вже оплатили курс, будь ласка, активуйте цього бота за посиланням, отриманим після оплати на сайті, або перейдіть до кабінету практикуму за кнопкою нижче:`;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sofifinsight.vercel.app';
      
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: defaultWelcome,
          protect_content: true,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌐 Відкрити кабінет',
                  url: `${siteUrl}/minicourse/login`
                }
              ]
            ]
          }
        })
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Bot Webhook Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
