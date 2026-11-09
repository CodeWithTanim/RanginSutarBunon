import { OrderRecord, SiteSettings } from './initialData';
import { getSettings } from './db';

interface TelegramSendResult {
  success: boolean;
  sentCount: number;
  totalCount: number;
  errors: { chatId: string; error: string }[];
}

export function parseChatIds(rawChatIds: string): string[] {
  if (!rawChatIds) return [];
  return rawChatIds
    .split(/[\n,;]+/)
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

export async function sendTelegramOrderNotification(order: OrderRecord): Promise<TelegramSendResult> {
  try {
    const settings: SiteSettings = await getSettings();
    const token = settings.telegramBotToken?.trim() || process.env.TELEGRAM_BOT_TOKEN?.trim();
    const rawChatIds = settings.telegramChatIds?.trim() || process.env.TELEGRAM_CHAT_IDS?.trim() || '';
    const isEnabled = settings.telegramEnabled || process.env.TELEGRAM_ENABLED === 'true';

    if (!isEnabled || !token || !rawChatIds) {
      return { success: false, sentCount: 0, totalCount: 0, errors: [] };
    }

    const chatIds = parseChatIds(rawChatIds);
    if (chatIds.length === 0) {
      return { success: false, sentCount: 0, totalCount: 0, errors: [] };
    }

    const formattedTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Dhaka',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const itemsList = order.items
      .map(
        (item, idx) =>
          `  ${idx + 1}. <b>${item.productName}</b>\n     ▫️ পরিমাণ: ${item.quantity}টি × ৳${item.price} = <b>৳${item.total}</b>`
      )
      .join('\n');

    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rangin-sutar-bunon.vercel.app';

    const messageHtml =
      `🛍️ <b>নতুন অর্ডার এসেছে! (New Order Placed)</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🆔 <b>Order ID:</b> <code>${order.id}</code>\n` +
      `👤 <b>গ্রাহকের নাম:</b> ${order.customerName}\n` +
      `📱 <b>মোবাইল নম্বর:</b> <code>${order.mobile}</code>\n` +
      `📍 <b>ডেলিভারি ঠিকানা:</b>\n` +
      `   ${order.address}, ${order.city}, ${order.state} - ${order.pincode}\n` +
      (order.note ? `💬 <b>গ্রাহকের নোট:</b> <i>${order.note}</i>\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 <b>অর্ডারকৃত পণ্যসমূহ:</b>\n` +
      `${itemsList}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💵 <b>সাবটোটাল:</b> ৳${order.subtotal}\n` +
      `🚚 <b>ডেলিভারি চার্জ:</b> ৳${order.deliveryCharge}\n` +
      `💰 <b>সর্বমোট বিল:</b> <b>৳${order.totalAmount}</b> (Cash on Delivery)\n` +
      `📅 <b>সময়:</b> ${formattedTime} (বাংলাদেশ সময়)\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🔗 <a href="${siteUrl}/boss/orders">অর্ডার ড্যাশবোর্ডে দেখুন</a>`;

    const errors: { chatId: string; error: string }[] = [];
    let sentCount = 0;

    const dispatchPromises = chatIds.map(async (chatId) => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageHtml,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
        });

        const data = await response.json();
        if (data.ok) {
          sentCount++;
        } else {
          errors.push({ chatId, error: data.description || 'Unknown Telegram API error' });
        }
      } catch (err: any) {
        errors.push({ chatId, error: err.message || 'Network error reaching Telegram API' });
      }
    });

    await Promise.allSettled(dispatchPromises);

    return {
      success: sentCount > 0,
      sentCount,
      totalCount: chatIds.length,
      errors,
    };
  } catch (err: any) {
    console.error('[Telegram Notification] Unexpected error:', err);
    return { success: false, sentCount: 0, totalCount: 0, errors: [{ chatId: 'all', error: err.message }] };
  }
}

export async function sendTelegramTestMessage(
  token: string,
  rawChatIds: string
): Promise<TelegramSendResult> {
  const cleanToken = token.trim();
  const chatIds = parseChatIds(rawChatIds);

  if (!cleanToken) {
    throw new Error('Telegram Bot Token is required.');
  }

  if (chatIds.length === 0) {
    throw new Error('At least one Telegram Chat ID is required.');
  }

  const testMessage =
    `🧪 <b>Telegram Bot Test Notification</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `✅ আপনার টেলিগ্রাম বট সফলভাবে যুক্ত হয়েছে!\n` +
    `🏪 <b>দোকান:</b> রঙিন সুতার বুনন (Rangin Sutar Bunon)\n` +
    `⏰ <b>সময়:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })} (BD Time)\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `এখন থেকে ওয়েবসাইটে যেকোনো নতুন অর্ডার আসার সাথে সাথেই এই চ্যাটে তাৎক্ষণিক নোটিফিকেশন পৌঁছে যাবে।`;

  const errors: { chatId: string; error: string }[] = [];
  let sentCount = 0;

  const promises = chatIds.map(async (chatId) => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: testMessage,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        sentCount++;
      } else {
        errors.push({ chatId, error: data.description || 'Failed to send' });
      }
    } catch (err: any) {
      errors.push({ chatId, error: err.message || 'Network error' });
    }
  });

  await Promise.allSettled(promises);

  return {
    success: sentCount > 0,
    sentCount,
    totalCount: chatIds.length,
    errors,
  };
}

