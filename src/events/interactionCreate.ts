import { Events, type Interaction } from 'discord.js';
import { handleCommand } from '../handlers/commandHandler.js';
import { handleButton } from '../handlers/buttonHandler.js';
import { handleSelectMenu } from '../handlers/selectMenuHandler.js';
import { handleModal } from '../handlers/modalHandler.js';
import { handleAutocomplete } from '../handlers/autocompleteHandler.js';

export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction) {
  try {
    if (interaction.isAutocomplete()) {
      await handleAutocomplete(interaction);
    } else if (interaction.isChatInputCommand()) {
      await handleCommand(interaction);
    } else if (interaction.isMessageContextMenuCommand() || interaction.isUserContextMenuCommand()) {
      await handleCommand(interaction);
    } else if (interaction.isButton()) {
      await handleButton(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModal(interaction);
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
  }
}




/*
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
    
        if (!command || !command.autocomplete) {
            console.error(`No autocomplete handler for ${interaction.commandName}`);
            return;
        }

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        }
        return;
    }
    
    // Slash Commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No slash command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            // TODO: Add logging and error handling here
            console.error(error);
            const reply = { content: 'There was an error executing this command!', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }

    // Context Menus
    if (interaction.isContextMenuCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No context menu matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            // TODO: Add logging and error handling here
            console.error(error);
            const reply = { content: 'There was an error executing this command!', ephemeral: true };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    }
});
*/