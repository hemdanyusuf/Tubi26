import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import sql from 'mssql';
import { getPool } from './db';

export type AuthedRequest = Request & { user: { id: number; username: string } };

function sha256Hex(value: string) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

export function generateToken() {
  // 32 bytes -> 64 hex chars
  return crypto.randomBytes(32).toString('hex');
}

export async function createUser(usernameRaw: string) {
  const username = usernameRaw.trim();
  if (!username || username.length > 64) {
    throw new Error('Geçersiz kullanıcı adı.');
  }

  const token = generateToken();
  const tokenHash = sha256Hex(token);

  const pool = await getPool();
  try {
    const result = await pool
      .request()
      .input('username', sql.NVarChar(64), username)
      .input('token_hash', sql.Char(64), tokenHash)
      .query(
        `INSERT INTO dbo.users (username, token_hash)
         OUTPUT INSERTED.id AS id, INSERTED.username AS username
         VALUES (@username, @token_hash)`
      );

    const row = result.recordset[0] as { id: number; username: string };
    return { user: row, token };
  } catch (e) {
    // 2627/2601: unique constraint violation
    const err = e as any;
    if (err?.number === 2627 || err?.number === 2601) {
      throw new Error('Bu kullanıcı adı zaten kullanılıyor.');
    }
    throw e;
  }
}

export async function rotateToken(userId: number) {
  const token = generateToken();
  const tokenHash = sha256Hex(token);
  const pool = await getPool();
  await pool
    .request()
    .input('id', sql.Int, userId)
    .input('token_hash', sql.Char(64), tokenHash)
    .query(`UPDATE dbo.users SET token_hash=@token_hash WHERE id=@id`);
  return token;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization') || req.header('Authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  if (!token) {
    res.status(401).json({ ok: false, error: 'Authorization: Bearer <token> gerekli.' });
    return;
  }

  const tokenHash = sha256Hex(token);
  const pool = await getPool();
  const result = await pool
    .request()
    .input('token_hash', sql.Char(64), tokenHash)
    .query(`SELECT TOP 1 id, username FROM dbo.users WHERE token_hash=@token_hash`);

  const row = result.recordset[0] as { id: number; username: string } | undefined;
  if (!row) {
    res.status(401).json({ ok: false, error: 'Geçersiz token.' });
    return;
  }

  (req as AuthedRequest).user = { id: row.id, username: row.username };
  next();
}

