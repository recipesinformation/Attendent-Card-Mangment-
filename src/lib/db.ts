import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // If a remote database (Postgres, MySQL, etc.) is configured, use it directly
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  // On Vercel / AWS Lambda serverless runtime, filesystem outside /tmp is read-only.
  // We copy the pre-seeded SQLite database to /tmp so it is fully readable AND writable.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDir = '/tmp';
    const tmpDb = path.join(tmpDir, 'dev.db');

    // Always copy the fresh bundled database to /tmp on every cold start
    // so new data and deployments always take effect
    try {
      fs.mkdirSync(tmpDir, { recursive: true });
    } catch (e) {
      // ignore if exists
    }

    const candidatePaths = [
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), 'dev.db'),
      path.resolve(process.cwd(), '.next/server/prisma/dev.db'),
      path.resolve(__dirname, 'prisma/dev.db'),
      path.resolve(__dirname, '../prisma/dev.db'),
      path.resolve(__dirname, '../../prisma/dev.db'),
      path.resolve(__dirname, '../../../prisma/dev.db'),
    ];

    let found = false;
    for (const candidate of candidatePaths) {
      try {
        if (fs.existsSync(candidate)) {
          fs.copyFileSync(candidate, tmpDb);
          console.log(`[DB] Copied fresh database from ${candidate} to ${tmpDb}`);
          found = true;
          break;
        }
      } catch (e) {
        console.warn(`[DB] Could not copy from ${candidate}:`, e);
      }
    }

    if (!found) {
      console.warn('[DB] Warning: Pre-seeded database not found in any candidate path.');
    }

    return `file:${tmpDb}`;
  }

  return envUrl || 'file:./dev.db';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

