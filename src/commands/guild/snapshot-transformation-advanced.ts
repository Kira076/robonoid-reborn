import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  PermissionFlagsBits,
  ChannelType,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ComponentType
} from 'discord.js';
import { prisma } from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('snapshot-transformation-advanced')
  .setDescription('Create a transformation with channel selection')
  .addStringOption(option =>
    option.setName('name')
      .setDescription('Name for this transformation')
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

  const name = interaction.options.getString('name', true);

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
    await interaction.reply({
      content: `A transformation named "${name}" already exists!`,
      ephemeral: true
    });
    return;
  }

  // Fetch channels
  const channels = await interaction.guild.channels.fetch();
  const selectableChannels = Array.from(channels.values())
    .filter(ch => 
      ch && (
        ch.type === ChannelType.GuildText || 
        ch.type === ChannelType.GuildVoice ||
        ch.type === ChannelType.GuildCategory
      )
    )
    .sort((a, b) => (a!.position || 0) - (b!.position || 0))
    .slice(0, 25); // Discord limit for select menus

  if (selectableChannels.length === 0) {
    await interaction.reply({
      content: 'No channels available to snapshot!',
      ephemeral: true
    });
    return;
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('select_channels_for_snapshot')
    .setPlaceholder('Select channels to include')
    .setMinValues(1)
    .setMaxValues(selectableChannels.length)
    .addOptions(
      selectableChannels.map(ch => {
        const emoji = 
          ch!.type === ChannelType.GuildText ? '📝' :
          ch!.type === ChannelType.GuildVoice ? '🔊' :
          '📁';
        
        return {
          label: ch!.name,
          description: `ID: ${ch!.id}`,
          value: ch!.id,
          emoji: emoji
        };
      })
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(selectMenu);

  const response = await interaction.reply({
    content: `Creating transformation **"${name}"**\nSelect which channels to include:`,
    components: [row],
    ephemeral: true
  });

  try {
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000 // 60 seconds
    });

    collector.on('collect', async (selectInteraction) => {
      if (selectInteraction.customId !== 'select_channels_for_snapshot') return;

      await selectInteraction.deferUpdate();

      const selectedIds = selectInteraction.values;
      const mappings = selectedIds.map(id => {
        const channel = channels.get(id);
        return {
          channelId: id,
          newName: channel!.name
        };
      });

      try {
        await prisma.transformation.create({
          data: {
            guildId: interaction.guild!.id,
            name: name,
            channelMappings: {
              create: mappings
            }
          }
        });

        await selectInteraction.editReply({
          content: `Created transformation **"${name}"** with ${mappings.length} channels!\n\nUse \`/edit-transformation name:${name}\` to modify names.`,
          components: []
        });

        collector.stop();
      } catch (error) {
        console.error('Error creating transformation:', error);
        await selectInteraction.editReply({
          content: 'An error occurred while creating the transformation.',
          components: []
        });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: 'Selection timed out. Please try again.',
          components: []
        });
      }
    });

  } catch (error) {
    console.error('Error in snapshot command:', error);
    await interaction.editReply({
      content: 'An error occurred.',
      components: []
    });
  }
}