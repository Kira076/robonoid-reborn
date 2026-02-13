import { StringSelectMenuInteraction } from 'discord.js';
import { handleApplyTransformation } from './selects/applyTransformation.js';

export async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  try {
    switch (interaction.customId) {
      case 'apply_transformation:false':
        await handleApplyTransformation(interaction);
        break;
      case 'apply_transformation:true':
        await handleApplyTransformation(interaction);
        break;
      
      default:
        console.warn(`No handler for select menu: ${interaction.customId}`);
    }
  } catch (error) {
    console.error(`Error handling select menu ${interaction.customId}:`, error);
    
    const reply = { 
      content: 'An error occurred while processing your selection.', 
      ephemeral: true 
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
}