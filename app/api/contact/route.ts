import { NextResponse } from 'next/server';
import { createContactMessage, getContactMessages } from '@/lib/db';
import { sendTelegramContactNotification } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'Name, Email, Phone, and Message are required' },
        { status: 400 }
      );
    }

    const newMessage = await createContactMessage({
      name,
      email,
      phone,
      subject: subject || null,
      message,
    });

    // Non-blocking Telegram notification to admins
    sendTelegramContactNotification({
      name,
      email,
      phone,
      subject,
      message,
    }).catch((err) => console.error('[Contact Form] Telegram alert warning:', err));

    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting contact message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const messages = await getContactMessages();
    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
