import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { sendTelegramTestMessage } from '@/lib/telegram';

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { botToken, chatIds } = await request.json();

    if (!botToken || !botToken.trim()) {
      return NextResponse.json({ error: 'Telegram Bot Token is required' }, { status: 400 });
    }

    if (!chatIds || !chatIds.trim()) {
      return NextResponse.json({ error: 'At least one Telegram Chat ID is required' }, { status: 400 });
    }

    const result = await sendTelegramTestMessage(botToken, chatIds);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error testing Telegram notification:', error);
    return NextResponse.json({ error: error.message || 'Failed to send test message' }, { status: 500 });
  }
}

