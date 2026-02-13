import { ChannelType } from 'discord.js';
import { prisma } from '../database.js';

export async function applyTransformation(
  interaction: any, 
  transformationName: string,
  updateDirectory: boolean = false
) {
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

    // Track old names for directory replacement
    const nameChanges: Array<{ oldName: string; newName: string }> = [];

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
        
        // Store the name change for directory update
        nameChanges.push({ oldName, newName: mapping.newName });
        
        results.push(`${oldName} → ${mapping.newName}`);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        results.push(`Failed: ${mapping.channelId}`);
      }
    }

    let responseMessage = `**Transformation "${transformationName}" applied!**\n\n${results.join('\n')}`;

    // Update directory if requested
    if (updateDirectory) {
      try {
        const guild = await prisma.guild.findUnique({
          where: { id: interaction.guild.id }
        });

        if (guild?.directoryMessageId && guild?.directoryChannelId) {
          const directoryChannel = await interaction.guild.channels.fetch(guild.directoryChannelId);
          console.log('Fetched directory channel:', directoryChannel);

          if (directoryChannel?.isTextBased()) {
            const directoryMessage = await directoryChannel.messages.fetch(guild.directoryMessageId);
            console.log('Fetched directory message:', directoryMessage);

            if (directoryMessage) {
              let updatedContent = directoryMessage.content;
              
              // Replace each old name with new name
              for (const { oldName, newName } of nameChanges) {
                // Use regex with word boundaries to avoid partial matches
                // and make it case-insensitive for better matching
                const regex = new RegExp(oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                updatedContent = updatedContent.replace(regex, newName);
              }
              
              await directoryMessage.edit(updatedContent);
              responseMessage += '\n\nDirectory message updated!';
            } else {
              responseMessage += '\n\nDirectory message not found (it may have been deleted)';
            }
          }
        } else {
          responseMessage += '\n\nNo directory message set. Use `/set-directory` to configure one.';
        }
      } catch (error) {
        console.error('Error updating directory:', error);
        responseMessage += '\n\nFailed to update directory message';
      }
    }

    await interaction.editReply({ content: responseMessage });

  } catch (error) {
    console.error('Error applying transformation:', error);
    await interaction.editReply('An error occurred.');
  }
}