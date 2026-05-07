import express from 'express';
import sql from 'mssql';
import { authMiddleware, createUser, rotateToken, type AuthedRequest } from './auth';
import { getPool } from './db';

export function createApiRouter() {
  const router = express.Router();

  router.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  router.get('/db/health', async (_req, res) => {
    try {
      const pool = await getPool();
      const result = await pool.request().query('SELECT 1 AS ok');
      res.json({ ok: true, mssql: result.recordset });
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : String(e);
      res.status(500).json({ ok: false, error: message });
    }
  });

  // Auth (simple token)
  router.post('/auth/register', async (req, res) => {
    try {
      const username = String(req.body?.username ?? '');
      const created = await createUser(username);
      res.json({ ok: true, user: created.user, token: created.token });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      res.status(400).json({ ok: false, error: message });
    }
  });

  // Token rotation (requires auth)
  router.post('/auth/rotate-token', authMiddleware, async (req, res) => {
    try {
      const { id } = (req as AuthedRequest).user;
      const token = await rotateToken(id);
      res.json({ ok: true, token });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      res.status(500).json({ ok: false, error: message });
    }
  });

  // Current user (requires auth)
  router.get('/me', authMiddleware, (req, res) => {
    res.json({ ok: true, user: (req as AuthedRequest).user });
  });

  // Per-user settings (JSON payload persisted as string)
  router.get('/me/settings', authMiddleware, async (req, res) => {
    try {
      const { id } = (req as AuthedRequest).user;
      const pool = await getPool();
      const result = await pool
        .request()
        .input('user_id', sql.Int, id)
        .query(`SELECT data, updated_at FROM dbo.user_settings WHERE user_id=@user_id`);
      if (!result.recordset[0]) {
        res.json({ ok: true, data: {}, updated_at: null });
        return;
      }
      const row = result.recordset[0] as { data: string; updated_at: string };
      let parsed: unknown = {};
      try {
        parsed = JSON.parse(row.data || '{}');
      } catch {
        parsed = {};
      }
      res.json({ ok: true, data: parsed, updated_at: row.updated_at });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      res.status(500).json({ ok: false, error: message });
    }
  });

  router.put('/me/settings', authMiddleware, async (req, res) => {
    try {
      const { id } = (req as AuthedRequest).user;
      const payload = req.body ?? {};
      const data = JSON.stringify(payload);

      const pool = await getPool();
      await pool
        .request()
        .input('user_id', sql.Int, id)
        .input('data', sql.NVarChar(sql.MAX), data)
        .query(
          `MERGE dbo.user_settings AS target
           USING (SELECT @user_id AS user_id, @data AS data) AS src
           ON target.user_id = src.user_id
           WHEN MATCHED THEN
             UPDATE SET data = src.data, updated_at = SYSUTCDATETIME()
           WHEN NOT MATCHED THEN
             INSERT (user_id, data) VALUES (src.user_id, src.data);`
        );

      res.json({ ok: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      res.status(500).json({ ok: false, error: message });
    }
  });

  // Logs / events
  router.post('/logs', authMiddleware, async (req, res) => {
    try {
      const { id } = (req as AuthedRequest).user;
      const action = String(req.body?.action ?? '').trim();
      if (!action || action.length > 128) {
        res.status(400).json({ ok: false, error: 'action zorunlu (max 128).' });
        return;
      }

      const data = req.body?.data === undefined ? null : JSON.stringify(req.body.data);
      const pool = await getPool();
      const result = await pool
        .request()
        .input('user_id', sql.Int, id)
        .input('action', sql.NVarChar(128), action)
        .input('data', sql.NVarChar(sql.MAX), data)
        .query(
          `INSERT INTO dbo.user_logs (user_id, action, data)
           OUTPUT INSERTED.id AS id, INSERTED.created_at AS created_at
           VALUES (@user_id, @action, @data)`
        );

      res.json({ ok: true, log: result.recordset[0] });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      res.status(500).json({ ok: false, error: message });
    }
  });

  router.get('/logs', authMiddleware, async (req, res) => {
    try {
      const { id } = (req as AuthedRequest).user;
      const limitRaw = String(req.query.limit ?? '50');
      const limit = Math.max(1, Math.min(200, parseInt(limitRaw, 10) || 50));

      const pool = await getPool();
      const result = await pool
        .request()
        .input('user_id', sql.Int, id)
        .input('limit', sql.Int, limit)
        .query(
          `SELECT TOP (@limit) id, action, data, created_at
           FROM dbo.user_logs
           WHERE user_id=@user_id
           ORDER BY created_at DESC, id DESC`
        );

      const logs = result.recordset.map((r: any) => {
        let parsed: unknown = null;
        if (typeof r.data === 'string' && r.data.length) {
          try {
            parsed = JSON.parse(r.data);
          } catch {
            parsed = r.data;
          }
        }
        return { id: r.id, action: r.action, data: parsed, created_at: r.created_at };
      });

      res.json({ ok: true, logs });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      res.status(500).json({ ok: false, error: message });
    }
  });

  return router;
}

