import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'attendant-card-management-secret-key-2026-super-secure'
);

export interface UserSession {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
}

export async function signToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as UserSession;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;
  return await verifyToken(token);
}

export async function getSessionFromRequest(req: NextRequest): Promise<UserSession | null> {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}
