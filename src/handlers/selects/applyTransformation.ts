import { StringSelectMenuInteraction } from 'discord.js';
import { applyTransformation } from '../../utils/transformationUtils.js';

export async function handleApplyTransformation(interaction: StringSelectMenuInteraction) {
  const transformationName = interaction.values[0];
  // Parse the updateDirectory flag from customId
  const updateDirectory = interaction.customId.split(':')[1] === 'true';
  await applyTransformation(interaction, transformationName!);
}