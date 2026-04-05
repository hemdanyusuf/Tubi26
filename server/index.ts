import 'dotenv/config';
import express from 'express';
import { closePool, getPool } from './db';

const app = express();
app.use(express.json());

const PORT = Number(process.env.API_PORT) || 3001;

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/db/health', async (_req, res) => {
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

const server = app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`);
});

async function shutdown() {
  await closePool();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
