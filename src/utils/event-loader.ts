import { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

export async function loadEvents(client: Client) {
  const eventsPath = join('./dist', 'src', 'events');
  const eventFiles = readdirSync(eventsPath).filter(file => 
    //file.endsWith('.js') || file.endsWith('.ts')
    file.endsWith('.js')
  );

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const fileUrl = pathToFileURL(filePath).href;
    const event = await import(fileUrl);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}