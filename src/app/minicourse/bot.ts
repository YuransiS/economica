const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export async function sendTelegramNotification(
  chatId: number | null | undefined,
  messageType: 'hw_accepted' | 'hw_needs_improvement' | 'new_lesson_unlocked' | 'payment_success' | 'reminder',
  templateData: {
    userName?: string;
    lessonId?: number;
    lessonTitle?: string;
    comment?: string;
    actionUrl?: string;
  }
) {
  // If user hasn't linked their Telegram chat ID, skip notification silently
  if (!chatId) {
    console.log(`[Telegram Bot] Skipping notification of type ${messageType}: No chat_id linked.`);
    return false;
  }

  if (!BOT_TOKEN) {
    console.error('[Telegram Bot] Missing TELEGRAM_BOT_TOKEN environment variable.');
    return false;
  }

  let text = '';
  
  // Render message copy based on type (using clean developer drafts/placeholders to be customized later)
  switch (messageType) {
    case 'hw_accepted':
      text = `🎉 **Домашнє завдання прийнято!**\n\nЧудові новини, ${templateData.userName || 'ученю'}! Твоє завдання до Уроку ${templateData.lessonId || ''} успішно зараховано куратором.\n\n💬 *Коментар куратора:*\n"${templateData.comment || 'Чудова робота!'}"\n\n🔓 Тобі відкрито доступ до наступного уроку! Продовжуй рух до фінансових цілей.`;
      break;

    case 'hw_needs_improvement':
      text = `⚠️ **Домашнє завдання потребує доопрацювання**\n\nПривіт, ${templateData.userName || ''}. Куратор перевірив твоє ДЗ до Уроку ${templateData.lessonId || ''} та залишив кілька рекомендацій для покращення.\n\n💬 *Що потрібно виправити:*\n"${templateData.comment || 'Будь ласка, перевірте розрахунки.'}"\n\n👉 Будь ласка, внеси необхідні зміни в таблицю та надішли оновлене посилання в кабінеті практикуму.`;
      break;

    case 'new_lesson_unlocked':
      text = `🔓 **Відкрито новий урок!**\n\nТобі став доступний новий навчальний модуль:\n**Ефір ${templateData.lessonId || ''}: ${templateData.lessonTitle || ''}**\n\nСкоріш переглядай відео та виконуй практичні кроки!🚀`;
      break;

    case 'payment_success':
      text = `🚀 **Оплату успішно підтверджено!**\n\nВітаємо на курсі Софії! 🎉 Твій особистий кабінет активовано.\n\nЯ — твій личний Telegram-помічник. Тут я буду надсилати тобі корисні нагадування, результати перевірки домашніх завдань та коментарі кураторів. Давай розпочнемо навчання!`;
      break;

    case 'reminder':
      text = `⏳ **Час зробити наступний крок!**\n\nПривіт, ${templateData.userName || ''}! Нагадуємо, що Урок ${templateData.lessonId || ''} вже чекає на тебе. Виділи трохи часу сьогодні для роботи зі своїми фінансами та інвестиціями.\n\nУспіхів! 💪`;
      break;
      
    default:
      text = `Повідомлення від компаньйона Sofia Finsight!`;
  }

  // Add navigation button markup
  const replyMarkup = templateData.actionUrl ? {
    inline_keyboard: [
      [
        {
          text: '👉 Перейти в кабінет',
          url: templateData.actionUrl
        }
      ]
    ]
  } : undefined;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
        reply_markup: replyMarkup
      })
    });

    const result = await response.json();
    if (!result.ok) {
      console.error('[Telegram Bot] Send message API returned error:', result);
      return false;
    }

    console.log(`[Telegram Bot] Successfully sent notification of type ${messageType} to chat ID ${chatId}`);
    return true;
  } catch (err) {
    console.error('[Telegram Bot] Network error sending notification:', err);
    return false;
  }
}
