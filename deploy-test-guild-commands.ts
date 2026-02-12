import { REST, Routes } from 'discord.js';
//import { loadCommands } from 'dist/src/utils/command-handler.js';
import { loadCommands } from './src/utils/command-handler.js';
import 'dotenv/config';

async function deployCommands() {
  const commands = await loadCommands();
  const commandData = Array.from(commands.values()).map(cmd => cmd.data.toJSON());

  const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

  try {
    console.log(`Started refreshing ${commandData.length} application (/) commands.`);

    // For guild-specific (faster for testing)
    await rest.put(
       Routes.applicationGuildCommands(process.env.CLIENT_ID!, "708522699298832427"),
       { body: commandData }
     );

    // For global commands
    /*await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID!),
      { body: commandData }
    );*/

    console.log(`Successfully reloaded ${commandData.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
}

deployCommands();