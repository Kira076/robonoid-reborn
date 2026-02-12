import { ChannelType } from 'discord.js';
import { prisma } from '../database.js';

export async function applyTransformation(interaction: any, transformationName: string) {
  await interaction.deferReply({ ephemeral: true });

  try {
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
          results.push(`Skipped ${channel.name} (unsupported type)`);
          continue;
        }

        const oldName = channel.name;
        await channel.setName(mapping.newName);
        results.push(`${oldName} → ${mapping.newName}`);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        results.push(`Failed: ${mapping.channelId}`);
      }
    }

    await interaction.editReply({
      content: `**Transformation "${transformationName}" applied!**\n\n${results.join('\n')}`
    });

  } catch (error) {
    console.error('Error applying transformation:', error);
    await interaction.editReply('An error occurred.');
  }
}