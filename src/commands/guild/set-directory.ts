import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  PermissionFlagsBits
} from 'discord.js';
import { prisma } from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('set-directory')
  .setDescription('Set the channel directory message to auto-update')
  .addStringOption(option =>
    option.setName('message-link')
      .setDescription('Right-click the directory message → Copy Message Link')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ 
      content: 'This command can only be used in a server!', 
      ephemeral: true 
    });
    return;
  }

  const messageLink = interaction.options.getString('message-link', true);

  await interaction.deferReply({ ephemeral: true });

  try {
    // Parse message link
    const linkRegex = /https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
    const match = messageLink.match(linkRegex);

    if (!match) {
      await interaction.editReply('Invalid message link!');
      return;
    }

    const [, guildId, channelId, messageId] = match;

    if (guildId !== interaction.guild.id) {
      await interaction.editReply('That message is not from this server!');
      return;
    }

    // Verify message exists
    const channel = await interaction.guild.channels.fetch(channelId!);
    if (!channel?.isTextBased()) {
      await interaction.editReply('Channel not found!');
      return;
    }

    const message = await channel.messages.fetch(messageId!);
    if (!message) {
      await interaction.editReply('Message not found!');
      return;
    }

    // Store in database
    await prisma.guild.upsert({
      where: { id: interaction.guild.id },
      update: {
        directoryMessageId: messageId,
        directoryChannelId: channelId
      },
      create: {
        id: interaction.guild.id,
        directoryMessageId: messageId,
        directoryChannelId: channelId
      }
    });

    await interaction.editReply(
      `Set directory message! The magical-girl command will now offer to update this message when transformations are applied.`
    );

  } catch (error) {
    console.error('Error setting directory:', error);
    await interaction.editReply('An error occurred while setting the directory message.');
  }
}