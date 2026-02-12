import { readdir } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import type { ExtendedClient } from './CustomClient.js';

export async function loadModules(client: ExtendedClient, dirPath: string): Promise<void> {
  const files = await readdir(dirPath, { recursive: true });
  
  for (const file of files) {
    // if (file.endsWith('.js') || file.endsWith('.ts')) {
    if (file.endsWith('.js')) {
      const filePath = join(dirPath, file);
      const command = await import(pathToFileURL(filePath).href);
      
     if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            // TODO: Add logging and error handling here
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
  }
}

export function resolveAbsolutePath(fileURL: string, relativePath: string): string {
    const __filename = fileURLToPath(fileURL);
    const __dirname = dirname(__filename);
    return resolve(__dirname, relativePath);
}