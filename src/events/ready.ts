import { Events, Client } from 'discord.js';
import { loadCommands } from '../utils/command-handler.js';
import type { ExtendedClient } from '../utils/CustomClient.js';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: ExtendedClient) {
  console.log(`Logged in as ${client.user?.tag}`);
  
  client.commands = await loadCommands();
  console.log(`Loaded ${client.commands.size} commands`);
}