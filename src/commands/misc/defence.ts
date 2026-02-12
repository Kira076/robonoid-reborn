import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("defence")
    .setDescription("Defence against the Dark Ones");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply("This is entrapment.");
};