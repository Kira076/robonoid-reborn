import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('magical-girl')
  .setDescription('Transform channel names using a saved transformation')
  .addBooleanOption(option =>
    option.setName('update-directory')
      .setDescription('Update the directory message after transformation (default: false)')
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: 'This command can only be used in a server!', flags: MessageFlags.Ephemeral });
    return;
  }

  const updateDirectory = interaction.options.getBoolean('update-directory') ?? false;

  const selectButton = new ButtonBuilder()
    .setCustomId(`select_transformation:${updateDirectory}`)
    .setLabel('Select Transformation')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('✨');

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(selectButton);

  await interaction.reply({
    content: `Click the button to select a transformation:${updateDirectory ? '\n*Directory will be updated after transformation*' : ''}`,
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}