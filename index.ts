import { Client, GatewayIntentBits } from 'discord.js';
import { prisma } from 'src/database';

const client = new Client({
  intents: [GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages]
});


