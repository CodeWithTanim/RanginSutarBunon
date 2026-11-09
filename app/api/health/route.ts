import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      databaseName: db.databaseName,
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message || 'Database ping failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
