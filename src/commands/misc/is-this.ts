import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("is-this")
    .setDescription("Is this.........?");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply(`\\|  \\|\\|
\\|\\| \\|_`);
};