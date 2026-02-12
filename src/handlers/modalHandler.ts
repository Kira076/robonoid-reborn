import { ModalSubmitInteraction } from 'discord.js';
import { handleEditTransformation } from './modals/editTransformation.js';
import { handleCreateTransformation } from './modals/createTransformation.js';

export async function handleModal(interaction: ModalSubmitInteraction) {
  try {
    if (interaction.customId.startsWith('edit_transformation:')) {
      await handleEditTransformation(interaction);
    } else if (interaction.customId === 'create_transformation') {
      await handleCreateTransformation(interaction);
    } else {
      console.warn(`No handler for modal: ${interaction.customId}`);
    }
  } catch (error) {
    console.error(`Error handling modal ${interaction.customId}:`, error);
    
    const reply = { 
      content: 'An error occurred while processing your submission.', 
      ephemeral: true 
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
}