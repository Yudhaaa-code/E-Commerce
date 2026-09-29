import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

export async function GET() {
  const status = await checkDatabaseConnection();
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    status: status.connected ? 'healthy' : 'fallback_mode',
    database: 'PostgreSQL',
    mode: status.mode,
    message: status.message,
    setupGuide: !status.connected
      ? 'Untuk menghubungkan PostgreSQL: pastikan server PostgreSQL Anda aktif dan sesuaikan DATABASE_URL di file .env, lalu jalankan `npm run db:push` dan `npm run db:seed`.'
      : 'Database PostgreSQL aktif dan terhubung dengan normal.',
  });
}
