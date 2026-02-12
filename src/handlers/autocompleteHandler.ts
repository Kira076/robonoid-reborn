import { AutocompleteInteraction } from 'discord.js';
import type { ExtendedClient } from '../utils/CustomClient.js';

export async function handleAutocomplete(interaction: AutocompleteInteraction) {
  const client = interaction.client as ExtendedClient
  const command = client.commands.get(interaction.commandName);
  
  if (!command || !command.autocomplete) {
    console.error(`No autocomplete handler for ${interaction.commandName}`);
    return;
  }

  try {
    await command.autocomplete(interaction);
  } catch (error) {
    console.error(`Error in autocomplete for ${interaction.commandName}:`, error);
  }
}