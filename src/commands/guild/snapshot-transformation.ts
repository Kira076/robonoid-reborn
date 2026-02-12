import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  PermissionFlagsBits,
  ChannelType
} from 'discord.js';
import { prisma } from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('snapshot-transformation')
  .setDescription('Create a transformation template from current channel names')
  .addStringOption(option =>
    option.setName('name')
      .setDescription('Name for this transformation')
      .setRequired(true)
  )
  .addBooleanOption(option =>
    option.setName('include-voice')
      .setDescription('Include voice channels (default: true)')
      .setRequired(false)
  )
  .addBooleanOption(option =>
    option.setName('include-categories')
      .setDescription('Include categories (default: true)')
      .setRequired(false)
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

  const name = interaction.options.getString('name', true);
  const includeVoice = interaction.options.getBoolean('include-voice') ?? true;
  const includeCategories = interaction.options.getBoolean('include-categories') ?? true;

  await interaction.deferReply({ ephemeral: true });

  try {
    // Check if transformation already exists
    const existing = await prisma.transformation.findUnique({
      where: {
        guildId_name: {
          guildId: interaction.guild.id,
          name: name
        }
      }
    });

    if (existing) {
      await interaction.editReply({
        content: `A transformation named "${name}" already exists! Use \`/edit-transformation\` to modify it or choose a different name.`
      });
      return;
    }

    // Fetch all channels
    const channels = await interaction.guild.channels.fetch();
    const mappings: Array<{ channelId: string; newName: string }> = [];

    for (const [id, channel] of channels) {
      if (!channel) continue;

      // Filter by channel type
      let shouldInclude = false;

      if (channel.type === ChannelType.GuildText) {
        shouldInclude = true;
      } else if (channel.type === ChannelType.GuildVoice && includeVoice) {
        shouldInclude = true;
      } else if (channel.type === ChannelType.GuildCategory && includeCategories) {
        shouldInclude = true;
      }

      if (shouldInclude) {
        mappings.push({
          channelId: id,
          newName: channel.name
        });
      }
    }

    if (mappings.length === 0) {
      await interaction.editReply({
        content: 'No channels found to snapshot!'
      });
      return;
    }

    // Create the transformation
    const transformation = await prisma.transformation.create({
      data: {
        guildId: interaction.guild.id,
        name: name,
        channelMappings: {
          create: mappings
        }
      }
    });

    // Build summary
    const textCount = mappings.filter(m => {
      const ch = channels.get(m.channelId);
      return ch?.type === ChannelType.GuildText;
    }).length;
    
    const voiceCount = mappings.filter(m => {
      const ch = channels.get(m.channelId);
      return ch?.type === ChannelType.GuildVoice;
    }).length;
    
    const categoryCount = mappings.filter(m => {
      const ch = channels.get(m.channelId);
      return ch?.type === ChannelType.GuildCategory;
    }).length;

    const summary = [
      `Created transformation **"${name}"** with ${mappings.length} channels:`,
      textCount > 0 ? `📝 ${textCount} text channels` : null,
      voiceCount > 0 ? `🔊 ${voiceCount} voice channels` : null,
      categoryCount > 0 ? `📁 ${categoryCount} categories` : null,
      '',
      `Use \`/edit-transformation name:${name}\` to modify the channel names,`,
      `then use \`/magical-girl\` to apply the transformation!`
    ].filter(Boolean).join('\n');

    await interaction.editReply({ content: summary });

  } catch (error) {
    console.error('Error creating snapshot:', error);
    await interaction.editReply({
      content: 'An error occurred while creating the snapshot.'
    });
  }
}