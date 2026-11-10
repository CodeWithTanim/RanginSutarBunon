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

function escapeHtml(text?: string | null): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getFormattedDhakaTime(): string {
  return new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://rangin-sutar-bunon.vercel.app';
}

/**
 * Central broadcast function sending HTML messages in parallel to all configured admin Telegram Chat IDs
 */
export async function sendTelegramBroadcast(messageHtml: string): Promise<TelegramSendResult> {
  try {
    const settings: SiteSettings = await getSettings(true);
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
          signal: AbortSignal.timeout(4500),
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

    if (errors.length > 0) {
      console.warn('[Telegram Broadcast] Partial delivery errors:', errors);
    }

    return {
      success: sentCount > 0,
      sentCount,
      totalCount: chatIds.length,
      errors,
    };
  } catch (err: any) {
    console.error('[Telegram Broadcast] Unexpected error:', err);
    return { success: false, sentCount: 0, totalCount: 0, errors: [{ chatId: 'all', error: err.message }] };
  }
}

/**
 * 1. New Customer Order Notification
 */
export async function sendTelegramOrderNotification(order: OrderRecord): Promise<TelegramSendResult> {
  const formattedTime = getFormattedDhakaTime();
  const siteUrl = getSiteUrl();

  const itemsList = order.items
    .map(
      (item, idx) =>
        `  ${idx + 1}. <b>${escapeHtml(item.productName)}</b>\n     ▫️ পরিমাণ: ${item.quantity}টি × ৳${item.price} = <b>৳${item.total}</b>`
    )
    .join('\n');

  const messageHtml =
    `🛍️ <b>নতুন অর্ডার এসেছে! (New Order Placed)</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🆔 <b>Order ID:</b> <code>${escapeHtml(order.id)}</code>\n` +
    `👤 <b>গ্রাহকের নাম:</b> ${escapeHtml(order.customerName)}\n` +
    `📱 <b>মোবাইল নম্বর:</b> <code>${escapeHtml(order.mobile)}</code>\n` +
    `📍 <b>ডেলিভারি ঠিকানা:</b>\n` +
    `   ${escapeHtml(order.address)}, ${escapeHtml(order.city)}, ${escapeHtml(order.state)} - ${escapeHtml(order.pincode)}\n` +
    (order.note ? `💬 <b>গ্রাহকের নোট:</b> <i>${escapeHtml(order.note)}</i>\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📦 <b>অর্ডারকৃত পণ্যসমূহ:</b>\n` +
    `${itemsList}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💵 <b>সাবটোটাল:</b> ৳${order.subtotal}\n` +
    `🚚 <b>ডেলিভারি চার্জ:</b> ৳${order.deliveryCharge}\n` +
    `💰 <b>সর্বমোট বিল:</b> <b>৳${order.totalAmount}</b> (Cash on Delivery)\n` +
    `⏰ <b>সময়:</b> ${formattedTime} (বাংলাদেশ সময়)\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🔗 <a href="${siteUrl}/boss/orders">অর্ডার ড্যাশবোর্ডে দেখুন</a>`;

  return sendTelegramBroadcast(messageHtml);
}

/**
 * 2. Order Status Update Notification
 */
export async function sendTelegramOrderStatusNotification(info: {
  orderId: string;
  newStatus: string;
  updatedBy?: string;
}): Promise<TelegramSendResult> {
  const formattedTime = getFormattedDhakaTime();
  const siteUrl = getSiteUrl();

  let statusEmoji = '🔄';
  if (info.newStatus === 'Delivered') statusEmoji = '🎉';
  if (info.newStatus === 'Shipped') statusEmoji = '🚚';
  if (info.newStatus === 'Confirmed') statusEmoji = '✅';
  if (info.newStatus === 'Cancelled') statusEmoji = '❌';

  const messageHtml =
    `${statusEmoji} <b>অর্ডার স্ট্যাটাস আপডেট! (Order Status Update)</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🆔 <b>Order ID:</b> <code>${escapeHtml(info.orderId)}</code>\n` +
    `📊 <b>নতুন স্ট্যাটাস:</b> <b>${escapeHtml(info.newStatus)}</b>\n` +
    (info.updatedBy ? `👤 <b>পরিবর্তনকারী:</b> <code>${escapeHtml(info.updatedBy)}</code>\n` : '') +
    `⏰ <b>সময়:</b> ${formattedTime} (BD Time)\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🔗 <a href="${siteUrl}/boss/orders">অর্ডার তালিকায় দেখুন</a>`;

  return sendTelegramBroadcast(messageHtml);
}

/**
 * 3. Contact Form Submission Notification
 */
export async function sendTelegramContactNotification(contact: {
  name: string;
  email: string;
  phone: string;
  subject?: string | null;
  message: string;
}): Promise<TelegramSendResult> {
  const formattedTime = getFormattedDhakaTime();
  const siteUrl = getSiteUrl();

  const messageHtml =
    `📩 <b>নতুন যোগাযোগ বার্তা! (New Contact Form Message)</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>প্রেরক:</b> ${escapeHtml(contact.name)}\n` +
    `📧 <b>ইমেইল:</b> <code>${escapeHtml(contact.email)}</code>\n` +
    `📱 <b>মোবাইল:</b> <code>${escapeHtml(contact.phone)}</code>\n` +
    (contact.subject ? `📌 <b>বিষয়:</b> ${escapeHtml(contact.subject)}\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💬 <b>বার্তা:</b>\n` +
    `<i>"${escapeHtml(contact.message)}"</i>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `⏰ <b>সময়:</b> ${formattedTime} (বাংলাদেশ সময়)\n` +
    `🔗 <a href="${siteUrl}/boss/messages">ইনবক্সে বার্তাটি দেখুন</a>`;

  return sendTelegramBroadcast(messageHtml);
}

/**
 * 4. Admin Login Notification (Success or Failed Attempt)
 */
export async function sendTelegramAdminLoginNotification(loginInfo: {
  username: string;
  ip: string;
  userAgent: string;
  success: boolean;
}): Promise<TelegramSendResult> {
  const formattedTime = getFormattedDhakaTime();

  if (loginInfo.success) {
    const messageHtml =
      `🔐 <b>অ্যাডমিন লগইন নোটিফিকেশন (Admin Sign-In)</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ <b>সফলভাবে ড্যাশবোর্ডে লগইন হয়েছে!</b>\n` +
      `👤 <b>অ্যাডমিন ইউজার:</b> <code>${escapeHtml(loginInfo.username)}</code>\n` +
      `🌐 <b>IP Address:</b> <code>${escapeHtml(loginInfo.ip)}</code>\n` +
      `📱 <b>ডিভাইস:</b> <i>${escapeHtml(loginInfo.userAgent.slice(0, 80))}</i>\n` +
      `⏰ <b>সময়:</b> ${formattedTime} (BD Time)\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🛡️ <i>এটি আপনি না হয়ে থাকলে অবিলম্বে পাসওয়ার্ড পরিবর্তন করুন।</i>`;

    return sendTelegramBroadcast(messageHtml);
  } else {
    const messageHtml =
      `🚨 <b>সতর্কতা: ব্যর্থ অ্যাডমিন লগইন চেষ্টা! (Failed Login Attempt)</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `❌ <b>ভুল পাসওয়ার্ড দিয়ে ড্যাশবোর্ডে প্রবেশের চেষ্টা করা হয়েছে!</b>\n` +
      `👤 <b>ইউজারনেম:</b> <code>${escapeHtml(loginInfo.username)}</code>\n` +
      `🌐 <b>IP Address:</b> <code>${escapeHtml(loginInfo.ip)}</code>\n` +
      `📱 <b>ডিভাইস:</b> <i>${escapeHtml(loginInfo.userAgent.slice(0, 80))}</i>\n` +
      `⏰ <b>সময়:</b> ${formattedTime} (BD Time)\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `⚠️ <i>দয়া করে আপনার অ্যাডমিন পোর্টাল নিরাপদ রাখুন।</i>`;

    return sendTelegramBroadcast(messageHtml);
  }
}

/**
 * 5. Admin Security / Profile Update Notification
 */
export async function sendTelegramAdminProfileChangeNotification(info: {
  previousUsername: string;
  updatedUsername: string;
  passwordChanged: boolean;
  nameChanged: boolean;
  ip: string;
}): Promise<TelegramSendResult> {
  const formattedTime = getFormattedDhakaTime();

  const messageHtml =
    `🛡️ <b>অ্যাডমিন সিকিউরিটি আপডেট (Credentials Changed)</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>পূর্বের ইউজারনেম:</b> <code>${escapeHtml(info.previousUsername)}</code>\n` +
    `👤 <b>নতুন ইউজারনেম:</b> <code>${escapeHtml(info.updatedUsername)}</code>\n` +
    `🔑 <b>পাসওয়ার্ড পরিবর্তন:</b> ${info.passwordChanged ? '✅ হ্যাঁ (Password Updated)' : 'অপরিবর্তিত'}\n` +
    (info.nameChanged ? `🏷️ <b>নাম পরিবর্তন:</b> হ্যাঁ\n` : '') +
    `🌐 <b>IP Address:</b> <code>${escapeHtml(info.ip)}</code>\n` +
    `⏰ <b>সময়:</b> ${formattedTime} (BD Time)\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🔒 <i>অ্যাডমিন অ্যাকাউন্টের অ্যাক্সেস তথ্য সফলভাবে হালনাগাদ হয়েছে।</i>`;

  return sendTelegramBroadcast(messageHtml);
}

/**
 * 6. New Customer Registration Notification
 */
export async function sendTelegramCustomerRegistrationNotification(customer: {
  name: string;
  mobile: string;
  address: string;
  city: string;
}): Promise<TelegramSendResult> {
  const formattedTime = getFormattedDhakaTime();
  const siteUrl = getSiteUrl();

  const messageHtml =
    `🎉 <b>নতুন কাস্টমার রেজিস্ট্রেশন! (New Customer Registered)</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>কাস্টমার নাম:</b> ${escapeHtml(customer.name)}\n` +
    `📱 <b>মোবাইল নম্বর:</b> <code>${escapeHtml(customer.mobile)}</code>\n` +
    `📍 <b>ঠিকানা:</b> ${escapeHtml(customer.address)}, ${escapeHtml(customer.city)}\n` +
    `⏰ <b>সময়:</b> ${formattedTime} (BD Time)\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👥 <a href="${siteUrl}/boss/customers">কাস্টমার ডিরেক্টরি দেখুন</a>`;

  return sendTelegramBroadcast(messageHtml);
}

/**
 * 7. Test Notification Message
 */
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
    `⏰ <b>সময়:</b> ${getFormattedDhakaTime()} (BD Time)\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `এখন থেকে ওয়েবসাইটে যেকোনো নতুন অর্ডার, মেসেজ, অ্যাডমিন লগইন ও সিকিউরিটি অ্যাক্টিভিটিতে তাৎক্ষণিক নোটিফিকেশন পৌঁছে যাবে।`;

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
