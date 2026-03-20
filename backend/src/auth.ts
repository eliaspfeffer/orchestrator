import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';

export function validateToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function generateToken(): string {
  return jwt.sign({ auth: true }, JWT_SECRET, { expiresIn: '7d' });
}
