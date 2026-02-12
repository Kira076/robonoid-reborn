import { StringSelectMenuInteraction } from 'discord.js';
import { applyTransformation } from '../../utils/transformationUtils.js';

export async function handleApplyTransformation(interaction: StringSelectMenuInteraction) {
  const transformationName = interaction.values[0];
  await applyTransformation(interaction, transformationName!);
}