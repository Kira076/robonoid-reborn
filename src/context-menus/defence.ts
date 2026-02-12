import { ContextMenuCommandBuilder, ApplicationCommandType, MessageContextMenuCommandInteraction, Message, MessageFlags } from 'discord.js';

export const data = new ContextMenuCommandBuilder()
  .setName('Defend Against')
  .setType(ApplicationCommandType.Message);

export async function execute(interaction: MessageContextMenuCommandInteraction) {
  //const message = interaction.targetMessage;
  await interaction.deferReply({ flags: MessageFlags.Ephemeral, });
  await interaction.targetMessage.reply('This is entrapment.');
  await interaction.deleteReply();
}