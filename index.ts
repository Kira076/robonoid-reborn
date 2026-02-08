import { Client, Events, GatewayIntentBits } from 'discord.js';
import "dotenv/config";
//import { prisma } from './src/database.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

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

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    if (message.content === 'ping') {
        await message.reply('pong');
    }
});

process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    //await prisma.$disconnect();
    process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);