/*import { Events } from 'discord.js';
import type { ExtendedClient } from '../utils/CustomClient.js';
import { prisma } from '../database.js';

const name = Events.GuildCreate;

export async function execute(guild: any) {
  console.log(`Joined guild: ${guild.name} (ID: ${guild.id})`);

  await prisma.guild.upsert({
        where: {
            id: guild.id,
        },
        create: {
            id: guild.id,
            name: guild.name ?? 'Unknown Guild',
        },
        update: {
            name: guild.name ?? 'Unknown Guild',
        },
    })
}*/