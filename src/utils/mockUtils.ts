import fs from 'fs/promises';
import path from 'path';

export async function getJsonFrom(filepath: string) {
  const jsonData = await fs.readFile(filepath);
  return JSON.parse(jsonData.toString());
}

export const filepath = path.join(
  process.cwd(),
  "src",
  "server",
  "db",
  "mock.json"
);