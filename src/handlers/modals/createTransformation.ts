import { ModalSubmitInteraction } from 'discord.js';
import { prisma } from '../../database.js';

export async function handleCreateTransformation(interaction: ModalSubmitInteraction) {
  const name = interaction.fields.getTextInputValue('name');
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
          content: `Channel ID ${channelId} not found!`
        });
        return;
      }

      mappings.push({ channelId, newName });
    }

    const transformation = await prisma.transformation.create({
      data: {
        guildId: interaction.guild!.id,
        name: name,
        channelMappings: {
          create: mappings.map(m => ({
            channelId: m.channelId,
            newName: m.newName
          }))
        }
      }
    });

    await interaction.editReply({
      content: `Created transformation "${name}" with ${mappings.length} channel mappings!`
    });

  } catch (error: any) {
    console.error('Error creating transformation:', error);
    
    if (error.code === 'P2002') {
      await interaction.editReply({
        content: `A transformation named "${name}" already exists!`
      });
    } else {
      await interaction.editReply({
        content: 'An error occurred while creating the transformation.'
      });
    }
  }
}