import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getDb } from './mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'rangin-sutar-bunon';

let mongoClient: MongoClient | null = null;
function getAuthMongoClient() {
  if (!mongoClient) {
    mongoClient = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
  }
  return mongoClient;
}

const authDb = getAuthMongoClient().db(dbName);

export const auth = betterAuth({
  database: mongodbAdapter(authDb),
  secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || 'rangin-sutar-bunon-super-secret-key-2026',
  baseURL: process.env.BETTER_AUTH_URL || 'https://rangin-sutar-bunon.vercel.app',
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'user' },
      mobile: { type: 'string', required: false },
      address: { type: 'string', required: false },
      city: { type: 'string', required: false },
      state: { type: 'string', required: false },
      pincode: { type: 'string', required: false },
    },
  },
});

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'rangin-sutar-bunon-super-secret-jwt-key-2026'
);

const COOKIE_NAME = 'admin_session_token';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createAdminToken(payload: { username: string; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifyAdminToken(token: string) {
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return verified.payload as { username: string; role: string };
  } catch {
    return null;
  }
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAdminToken(token);
}

export async function getBetterAuthSession(headersList?: Headers) {
  try {
    const { headers: nextHeaders } = await import('next/headers');
    const h = headersList || (await nextHeaders());
    return await auth.api.getSession({ headers: h });
  } catch (err) {
    return null;
  }
}

export async function getAdminUserFromDb(username: string) {
  try {
    const db = await getDb();
    return await db.collection('users').findOne({ username });
  } catch (err) {
    console.warn('MongoDB getAdminUserFromDb warning:', err);
    return null;
  }
}
