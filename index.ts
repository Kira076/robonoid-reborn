import { Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import "dotenv/config";
import * as fs from 'fs';
import * as path from 'path';

import { ExtendedClient as Client } from './src/utils/CustomClient.js';
import { loadCommands } from './src/utils/command-handler.js';
import { loadEvents } from './src/utils/event-loader.js';

//import { prisma } from './src/database.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent]
});

await loadEvents(client);

/*client.on(Events.GuildCreate, async (guild) => {
    await prisma.guild.upsert({
        where: {
            id: guild.id,
        },
        create: {
            id: guild.id,
            name: guild.name,
        },
        update: {
            name: guild.name,
        },
    })
});*/

process.on('SIGINT', async () => {
    // TODO: Add logging and error handling here
    console.log('Shutting down gracefully...');
    //await prisma.$disconnect();
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
