import { getPool } from './db';

export async function migrate() {
  const pool = await getPool();

  // Users
  await pool.request().query(`
IF OBJECT_ID(N'dbo.users', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.users (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    username NVARCHAR(64) NOT NULL UNIQUE,
    token_hash CHAR(64) NOT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSUTCDATETIME()
  );
END
ELSE
BEGIN
  -- Ensure username is NVARCHAR(64) NOT NULL
  IF EXISTS (
    SELECT 1
    FROM sys.columns c
    WHERE c.object_id = OBJECT_ID(N'dbo.users')
      AND c.name = N'username'
      AND c.max_length < 128
  )
  BEGIN
    ALTER TABLE dbo.users ALTER COLUMN username NVARCHAR(64) NOT NULL;
  END

  -- Ensure token_hash column exists
  IF COL_LENGTH(N'dbo.users', N'token_hash') IS NULL
  BEGIN
    EXEC(N'ALTER TABLE dbo.users ADD token_hash CHAR(64) NULL;');
    -- Populate for existing rows so we can make it NOT NULL (dynamic SQL to avoid compile-time column check)
    EXEC(N'
      UPDATE dbo.users
        SET token_hash = LOWER(CONVERT(VARCHAR(64), HASHBYTES(''SHA2_256'', CONVERT(NVARCHAR(36), NEWID())), 2))
        WHERE token_hash IS NULL;
    ');
    EXEC(N'ALTER TABLE dbo.users ALTER COLUMN token_hash CHAR(64) NOT NULL;');
  END

  -- Ensure created_at exists + is NOT NULL with a default
  IF COL_LENGTH(N'dbo.users', N'created_at') IS NULL
  BEGIN
    ALTER TABLE dbo.users ADD created_at DATETIME2(0) NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSUTCDATETIME();
  END
  ELSE
  BEGIN
    UPDATE dbo.users SET created_at = SYSUTCDATETIME() WHERE created_at IS NULL;
  END

  -- Legacy compatibility: some earlier schema may have password_hash as NOT NULL.
  IF COL_LENGTH(N'dbo.users', N'password_hash') IS NOT NULL
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM sys.columns c
      WHERE c.object_id = OBJECT_ID(N'dbo.users')
        AND c.name = N'password_hash'
        AND c.is_nullable = 0
    )
    BEGIN
      EXEC(N'ALTER TABLE dbo.users ALTER COLUMN password_hash NVARCHAR(255) NULL;');
    END
  END
END
`);

  // Per-user settings (arbitrary JSON)
  await pool.request().query(`
IF OBJECT_ID(N'dbo.user_settings', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.user_settings (
    user_id INT NOT NULL PRIMARY KEY,
    data NVARCHAR(MAX) NOT NULL CONSTRAINT DF_user_settings_data DEFAULT N'{}',
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_user_settings_updated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_user_settings_users FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE
  );
END
`);

  // User logs / events
  await pool.request().query(`
IF OBJECT_ID(N'dbo.user_logs', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.user_logs (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    action NVARCHAR(128) NOT NULL,
    data NVARCHAR(MAX) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_user_logs_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_user_logs_users FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE
  );

  CREATE INDEX IX_user_logs_user_id_created_at ON dbo.user_logs(user_id, created_at DESC);
END
`);
}

