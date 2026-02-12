import { ChatInputCommandInteraction, REST, Routes, SlashCommandBuilder } from "discord.js";
const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

export const data = new SlashCommandBuilder()
    .setName("command-deregister")
    .setDescription("Deregisters a command.");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await rest.put(
        Routes.applicationCommands(interaction.client.user.id),
        { body: [] },
    );
    await interaction.reply("All commands have been deregistered.");
};