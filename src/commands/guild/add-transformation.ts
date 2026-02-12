import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  PermissionFlagsBits 
} from 'discord.js';
import { prisma } from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('add-transformation')
  .setDescription('Add or update a channel transformation')
  .addStringOption(option =>
    option.setName('name')
      .setDescription('Name of the transformation (e.g., sailor-moon)')
      .setRequired(true)
  )
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('The channel to transform')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('new-name')
      .setDescription('The new name for this channel')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
    return;
  }

  const transformationName = interaction.options.getString('name', true);
  const channel = interaction.options.getChannel('channel', true);
  const newName = interaction.options.getString('new-name', true);

  try {
    // Get or create transformation
    let transformation = await prisma.transformation.findUnique({
      where: {
        guildId_name: {
          guildId: interaction.guild.id,
          name: transformationName
        }
      }
    });

    if (!transformation) {
      transformation = await prisma.transformation.create({
        data: {
          guildId: interaction.guild.id,
          name: transformationName
        }
      });
    }

    // Upsert the channel mapping
    await prisma.channelMapping.upsert({
      where: {
        transformationId_channelId: {
          transformationId: transformation.id,
          channelId: channel.id
        }
      },
      update: {
        newName: newName
      },
      create: {
        transformationId: transformation.id,
        channelId: channel.id,
        newName: newName
      }
    });

    await interaction.reply({
      content: `Added/updated mapping for transformation "${transformationName}":\n${channel.name} → ${newName}`,
      ephemeral: true
    });

  } catch (error) {
    console.error('Error adding transformation:', error);
    await interaction.reply({
      content: 'An error occurred while saving the transformation.',
      ephemeral: true
    });
  }
}