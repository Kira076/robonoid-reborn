import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  PermissionFlagsBits,
  MessageFlags,
} from 'discord.js';
import { prisma } from '../../database.ts';

export const data = new SlashCommandBuilder()
  .setName('register-guild')
  .setDescription('Register a guild in the database')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: 'This command can only be used in a server!', flags: MessageFlags.Ephemeral, });
    return;
  }

  const guild = interaction.guild;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral, });

  // Here you would typically create a new entry in your database for the guild
  // For example, using Prisma:
  /*
  await prisma.guild.upsert({
    where: { id: guild.id },
    create: { id: guild.id, name: guild.name ?? 'Unknown Guild' },
    update: { name: guild.name ?? 'Unknown Guild' },
  });
  */
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

    await interaction.editReply({ content: 'Guild registered/updated successfully!' });
};