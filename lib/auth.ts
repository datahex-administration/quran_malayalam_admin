import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');

export interface UserPayload {
  loginCode: string;
  role: 'creator' | 'verifier';
  iat?: number;
  exp?: number;
}

export async function createToken(payload: Omit<UserPayload, 'iat' | 'exp'>): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as UserPayload;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  return await verifyToken(token);
}

export function validateLoginCode(code: string): { valid: boolean; role: 'creator' | 'verifier' | null } {
  const creatorCodes = (process.env.CREATOR_CODES || '').split(',').map(c => c.trim()).filter(Boolean);
  const verifierCodes = (process.env.VERIFIER_CODES || '').split(',').map(c => c.trim()).filter(Boolean);

  if (creatorCodes.includes(code)) {
    return { valid: true, role: 'creator' };
  }

  if (verifierCodes.includes(code)) {
    return { valid: true, role: 'verifier' };
  }

  return { valid: false, role: null };
}
