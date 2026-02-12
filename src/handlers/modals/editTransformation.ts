import { ModalSubmitInteraction } from 'discord.js';
import { prisma } from '../../database.js';

export async function handleEditTransformation(interaction: ModalSubmitInteraction) {
  const transformationName = interaction.customId.split(':')[1];
  const mappingsText = interaction.fields.getTextInputValue('mappings');

  await interaction.deferReply({ ephemeral: true });

  try {
    const lines = mappingsText.split('\n').filter(line => line.trim());
    const mappings: Array<{ channelId: string; newName: string }> = [];

    for (const line of lines) {
      const [channelId, newName] = line.split(':').map(s => s.trim());
      
      if (!channelId || !newName) {
        await interaction.editReply({
          content: `Invalid format in line: "${line}"\nExpected format: channelId:newName`
        });
        return;
      }

      const channel = await interaction.guild?.channels.fetch(channelId).catch(() => null);
      if (!channel) {
        await interaction.editReply({
          content: `Channel ID ${channelId} not found in this server!`
        });
        return;
      }

      mappings.push({ channelId, newName });
    }

    const transformation = await prisma.transformation.findUnique({
      where: {
        guildId_name: {
          guildId: interaction.guild!.id,
          name: transformationName ?? ''
        }
      }
    });

    if (!transformation) {
      await interaction.editReply(`Transformation "${transformationName}" not found!`);
      return;
    }

    await prisma.channelMapping.deleteMany({
      where: { transformationId: transformation.id }
    });

    await prisma.channelMapping.createMany({
      data: mappings.map(m => ({
        transformationId: transformation.id,
        channelId: m.channelId,
        newName: m.newName
      }))
    });

    await interaction.editReply({
      content: `Successfully updated transformation "${transformationName}" with ${mappings.length} channel mappings!`
    });

  } catch (error) {
    console.error('Error updating transformation:', error);
    await interaction.editReply({
      content: 'An error occurred while updating the transformation.'
    });
  }
}