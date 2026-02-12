import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  PermissionFlagsBits,
  ChannelType 
} from 'discord.js';
import { prisma } from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('magical-girl')
  .setDescription('Transform channel names using a saved transformation')
  .addStringOption(option =>
    option.setName('transformation')
      .setDescription('The name of the transformation to apply')
      .setRequired(true)
      .setAutocomplete(true) // Enable autocomplete
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
    return;
  }

  const transformationName = interaction.options.getString('transformation', true);

  // Defer reply since this might take a while
  await interaction.deferReply({ ephemeral: true });

  try {
    // Fetch the transformation with its channel mappings
    const transformation = await prisma.transformation.findUnique({
      where: {
        guildId_name: {
          guildId: interaction.guild.id,
          name: transformationName
        }
      },
      include: {
        channelMappings: true
      }
    });

    if (!transformation) {
      await interaction.editReply(`Transformation "${transformationName}" not found!`);
      return;
    }

    if (transformation.channelMappings.length === 0) {
      await interaction.editReply(`Transformation "${transformationName}" has no channel mappings!`);
      return;
    }

    // Apply the transformation
    const results = [];
    for (const mapping of transformation.channelMappings) {
      try {
        const channel = await interaction.guild.channels.fetch(mapping.channelId);
        
        if (!channel) {
          results.push(`Channel ${mapping.channelId} not found`);
          continue;
        }

        if (channel.type !== ChannelType.GuildText && 
            channel.type !== ChannelType.GuildVoice &&
            channel.type !== ChannelType.GuildCategory) {
          results.push(`Skipped ${channel.name} (unsupported channel type)`);
          continue;
        }

        const oldName = channel.name;
        await channel.setName(mapping.newName);
        results.push(`${oldName} → ${mapping.newName}`);
        
        // Rate limit: wait a bit between renames to avoid hitting API limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        results.push(`Failed to rename channel ${mapping.channelId}: ${error}`);
      }
    }

    await interaction.editReply({
      content: `**Transformation "${transformationName}" applied!**\n\n${results.join('\n')}`
    });

  } catch (error) {
    console.error('Error applying transformation:', error);
    await interaction.editReply('An error occurred while applying the transformation.');
  }
}

// Handle autocomplete
export async function autocomplete(interaction: any) {
  if (!interaction.guild) return;

  const focusedValue = interaction.options.getFocused();

  try {
    const transformations = await prisma.transformation.findMany({
      where: {
        guildId: interaction.guild.id,
        name: {
          contains: focusedValue
        }
      },
      select: {
        name: true
      },
      take: 25 // Discord limits to 25 autocomplete options
    });

    await interaction.respond(
      transformations.map((t: { name: any; }) => ({
        name: t.name,
        value: t.name
      }))
    );
  } catch (error) {
    console.error('Error in autocomplete:', error);
    await interaction.respond([]);
  }
}