import fs from 'fs';
import path from 'path';

function readSecret(secretName: string): { value: string; searched: string[] } {
  const searched: string[] = [];

  // 1. Check Docker Secrets (Production / Docker Compose)
  const dockerSecretPath = path.join('/run/secrets', secretName);
  searched.push(dockerSecretPath);
  if (fs.existsSync(dockerSecretPath)) {
    return {
      value: fs.readFileSync(dockerSecretPath, 'utf8').trim(),
      searched,
    };
  }

  // 2. Check local .secrets folder
  const localSecretPath = path.join(
    process.cwd(),
    '.secrets',
    `${secretName}.txt`,
  );
  searched.push(localSecretPath);
  if (fs.existsSync(localSecretPath)) {
    return { value: fs.readFileSync(localSecretPath, 'utf8').trim(), searched };
  }

  // 3. Ultimate fallback to environment variables
  const envName = secretName.toUpperCase();
  searched.push(`process.env.${envName}`);
  return { value: process.env[envName] || '', searched };
}

export function getMongoUri(): string {
  // Allow full URI override if explicitly set in environment
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const user = readSecret('db_username');
  const pass = readSecret('db_password');

  // Default to the Docker service name 'mongodb:27017'
  const host = process.env.MONGO_DATABASE_HOST || 'mongodb';
  const port = process.env.MONGO_DATABASE_PORT || '27017';
  const dbName = process.env.MONGO_DATABASE_NAME || 'pulse_db';

  if (!user.value || !pass.value) {
    const missing = [];
    if (!user.value) missing.push('db_username');
    if (!pass.value) missing.push('db_password');

    // Throw a highly descriptive error showing exactly what failed and where it looked
    throw new Error(
      `Database credentials missing for: [${missing.join(', ')}].\n` +
        `Searched paths for db_username:\n - ${user.searched.join('\n - ')}`,
    );
  }

  return `mongodb://${user.value}:${pass.value}@${host}:${port}/${dbName}?authSource=admin`;
}
