import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  LabelBuilder
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('create-transformation')
  .setDescription('Create a new transformation using a modal')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId('create_transformation')
    .setTitle('Create New Transformation');

  const nameInput = new TextInputBuilder()
    .setCustomId('name')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('sailor-moon')
    .setRequired(true)
    .setMaxLength(50);

  const nameLabel = new LabelBuilder()
    .setLabel('Transformation Name')
    .setDescription('A unique name for this transformation (e.g. sailor-moon)')
    .setTextInputComponent(nameInput);

  const mappingsInput = new TextInputBuilder()
    .setCustomId('mappings')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('123456789:moon-palace\n987654321:starlight-tower')
    .setRequired(true);

  const mappingsLabel = new LabelBuilder()
    .setLabel('Channel Mappings (channelId:newName)')
    .setDescription('Enter one mapping per line, in the format channelId:newName')
    .setTextInputComponent(mappingsInput);

  modal.addLabelComponents(nameLabel, mappingsLabel);

  await interaction.showModal(modal);
}