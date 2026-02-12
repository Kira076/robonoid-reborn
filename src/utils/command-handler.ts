import { Collection } from 'discord.js';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

export async function loadCommands() {
  const commands: Collection<string, any> = new Collection();
  
  // Load slash commands
  await loadFromDirectory(join('./dist', 'src', 'commands'), commands);
  
  // Load context menus
  await loadFromDirectory(join('./dist', 'src', 'context-menus'), commands);
  
  return commands;
}

async function loadFromDirectory(directoryPath: string, commands: Collection<string, any>) {
  const items = readdirSync(directoryPath);

  for (const item of items) {
    const itemPath = join(directoryPath, item);
    const stat = statSync(itemPath);

    if (stat.isDirectory()) {
      // Recursively load from subdirectories
      await loadFromDirectory(itemPath, commands);
    //} else if (item.endsWith('.js') || item.endsWith('.ts')) {
    } else if (item.endsWith('.js')) {
      const fileUrl = pathToFileURL(itemPath).href;
      const command = await import(fileUrl);

      if ('data' in command && 'execute' in command) {
        commands.set(command.data.name, command);
      } else {
        console.warn(`[WARNING] Command at ${itemPath} is missing "data" or "execute"`);
      }
    }
  }
}