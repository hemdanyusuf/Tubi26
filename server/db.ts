import 'dotenv/config';
import sql from 'mssql';

function buildConfig(): sql.config {
  const server = process.env.MSSQL_SERVER;
  const database = process.env.MSSQL_DATABASE;
  const user = process.env.MSSQL_USER;
  const password = process.env.MSSQL_PASSWORD;

  if (!server || !database) {
    throw new Error(
      'MSSQL_SERVER ve MSSQL_DATABASE ortam değişkenleri zorunludur.'
    );
  }

  const port = process.env.MSSQL_PORT
    ? parseInt(process.env.MSSQL_PORT, 10)
    : undefined;

  const useWindowsAuth =
    process.env.MSSQL_USE_WINDOWS_AUTH === 'true' ||
    process.env.MSSQL_USE_WINDOWS_AUTH === '1';

  if (useWindowsAuth) {
    return {
      server,
      database,
      port,
      options: {
        encrypt: process.env.MSSQL_ENCRYPT !== 'false',
        trustServerCertificate:
          process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false',
        trustedConnection: true,
      },
    };
  }

  if (!user || password === undefined) {
    throw new Error(
      'SQL kimlik doğrulaması için MSSQL_USER ve MSSQL_PASSWORD gerekli (veya MSSQL_USE_WINDOWS_AUTH=true).'
    );
  }

  return {
    user,
    password,
    server,
    database,
    port,
    options: {
      encrypt: process.env.MSSQL_ENCRYPT !== 'false',
      trustServerCertificate:
        process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false',
    },
  };
}

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool?.connected) {
    return pool;
  }
  const config = buildConfig();
  const next = new sql.ConnectionPool(config);
  next.on('error', (err) => {
    console.error('MSSQL pool error:', err);
    pool = null;
  });
  await next.connect();
  pool = next;
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    try {
      await pool.close();
    } finally {
      pool = null;
    }
  }
}
