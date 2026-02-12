import { type ChatInputCommandInteraction, type ContextMenuCommandInteraction } from 'discord.js';
import type { ExtendedClient } from '../utils/CustomClient.js';

export async function handleCommand(
  interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction
): Promise<void> {
  const client = interaction.client as ExtendedClient;
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    
    const reply = { 
      content: 'There was an error executing this command!', 
      ephemeral: true 
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
}