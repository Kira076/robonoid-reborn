import { ButtonInteraction } from 'discord.js';
import { handleSelectTransformation } from './buttons/selectTransformation.js';

export async function handleButton(interaction: ButtonInteraction) {
  try {
    switch (interaction.customId) {
      case 'select_transformation':
        await handleSelectTransformation(interaction);
        break;
      
      // Add more button handlers here
      default:
        console.warn(`No handler for button: ${interaction.customId}`);
    }
  } catch (error) {
    console.error(`Error handling button ${interaction.customId}:`, error);
    
    const reply = { 
      content: 'An error occurred while processing your request.', 
      ephemeral: true 
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
}