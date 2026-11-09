import { NextResponse } from 'next/server';
import { getAdminSession, createAdminToken, setAdminSessionCookie } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    const user = await db.collection('users').findOne({ username: session.username });

    return NextResponse.json({
      username: user?.username || session.username,
      name: user?.name || 'Store Manager',
      role: user?.role || 'ADMIN',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch admin profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newUsername, newPassword, newName } = body;

    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required to verify changes' }, { status: 400 });
    }

    const db = await getDb();
    let user = await db.collection('users').findOne({ username: session.username });

    let isPasswordCorrect = false;

    if (user && user.passwordHash) {
      isPasswordCorrect = await bcrypt.compare(currentPassword, user.passwordHash);
    } else {
      // Fallback check against environment credentials if configured
      if (process.env.ADMIN_PASSWORD && currentPassword === process.env.ADMIN_PASSWORD) {
        isPasswordCorrect = true;
      }
    }

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 403 });
    }

    const updatedUsername = newUsername ? newUsername.trim() : session.username;

    // Check if new username is already taken by someone else
    if (updatedUsername !== session.username) {
      const existingUser = await db.collection('users').findOne({ username: updatedUsername });
      if (existingUser) {
        return NextResponse.json({ error: 'This username is already in use' }, { status: 400 });
      }
    }

    const updateFields: any = {
      username: updatedUsername,
      updatedAt: new Date().toISOString(),
    };

    if (newName) {
      updateFields.name = newName.trim();
    }

    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
      }
      updateFields.passwordHash = await bcrypt.hash(newPassword.trim(), 10);
    }

    // Update in MongoDB users collection
    await db.collection('users').updateOne(
      { username: session.username },
      {
        $set: updateFields,
        $setOnInsert: {
          id: `user-${Date.now()}`,
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    // Refresh admin session cookie with new username
    const newToken = await createAdminToken({
      username: updatedUsername,
      role: 'ADMIN',
    });
    await setAdminSessionCookie(newToken);

    return NextResponse.json({
      success: true,
      message: 'Admin credentials updated successfully!',
      username: updatedUsername,
    });
  } catch (error: any) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to update admin profile' }, { status: 500 });
  }
}

