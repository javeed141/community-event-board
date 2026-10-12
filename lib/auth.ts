import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'events_secret_key_123';

// Generate JWT token
export function signToken(payload: string | object | Buffer) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Compare password with hash
export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Hash password
export async function hashPassword(plainPassword: string) {
  return await bcrypt.hash(plainPassword, 10);
}

// Get authenticated user payload from request cookie or header
export function getAuthUser(request: Request): { userId: string; email: string; role: string } | null {
  // Check cookie header
  const cookieHeader = request.headers.get('cookie') || '';
  let token = null;

  const match = cookieHeader.match(/auth_token=([^;]+)/);
  if (match) {
    token = match[1];
  }

  // Check Authorization Bearer header
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return null;
  }

  return verifyToken(token) as { userId: string; email: string; role: string } | null;
}

// Verify Admin role via JWT or custom header 'x-admin-key'
export function verifyAdmin(request: Request): { userId: string; email: string; role: string } | null {
  const auth = getAuthUser(request);
  if (auth && auth.role === 'admin') {
    return auth;
  }

  const adminKey = request.headers.get('x-admin-key');
  const expectedKey = process.env.ADMIN_API_KEY || 'admin_super_secret_key_2026';
  if (adminKey && adminKey === expectedKey) {
    return { userId: 'admin_api_user', email: 'admin@community.com', role: 'admin' };
  }

  return null;
}
