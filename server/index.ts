import 'dotenv/config';
import express from 'express';
import { closePool, getPool } from './db';
import { migrate } from './migrate';
import { createApiRouter } from './routes';

const app = express();
app.use(express.json());

const PORT = Number(process.env.API_PORT) || 3001;

app.use('/api', createApiRouter());

const server = app.listen(PORT, async () => {
  try {
    await getPool();
    await migrate();
    console.log(`API http://localhost:${PORT}`);
  } catch (e) {
    console.error('API failed to start:', e);
    process.exit(1);
  }
});

async function shutdown() {
  await closePool();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
