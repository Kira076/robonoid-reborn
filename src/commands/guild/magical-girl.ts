import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('magical-girl')
  .setDescription('Transform channel names using a saved transformation')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
    return;
  }

  const selectButton = new ButtonBuilder()
    .setCustomId('select_transformation')
    .setLabel('Select Transformation')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('✨');

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(selectButton);

  await interaction.reply({
    content: 'Click the button to select a transformation:',
    components: [row],
    ephemeral: true
  });
}