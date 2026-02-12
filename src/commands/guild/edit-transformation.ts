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
import { prisma } from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('edit-transformation')
  .setDescription('Edit a transformation in bulk using a modal')
  .addStringOption(option =>
    option.setName('name')
      .setDescription('Name of the transformation to edit')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
    return;
  }

  const transformationName = interaction.options.getString('name', true);

  // Fetch existing transformation
  const transformation = await prisma.transformation.findUnique({
    where: {
      guildId_name: {
        guildId: interaction.guild.id,
        name: transformationName
      }
    },
    include: {
      channelMappings: true
    }
  });

  if (!transformation) {
    await interaction.reply({
      content: `Transformation "${transformationName}" not found!`,
      ephemeral: true
    });
    return;
  }

  // Format existing mappings for the modal
  const mappingsText = transformation.channelMappings
    .map((m: { channelId: any; newName: any; }) => `${m.channelId}:${m.newName}`)
    .join('\n');

  // Create modal
  const modal = new ModalBuilder()
    .setCustomId(`edit_transformation:${transformationName}`)
    .setTitle(`Edit: ${transformationName}`);

  const mappingsInput = new TextInputBuilder()
    .setCustomId('mappingsInput')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('123456789:new-channel-name\n987654321:another-channel')
    .setValue(mappingsText)
    .setRequired(true);

  const mappingsLabel = new LabelBuilder()
    .setLabel('Channel Mappings (channelId:newName)')
    .setDescription('Enter one mapping per line, in the format channelId:newName')
    .setTextInputComponent(mappingsInput);

  modal.addLabelComponents(mappingsLabel);

  await interaction.showModal(modal);
}

export async function autocomplete(interaction: any) {
  if (!interaction.guild) return;

  const focusedValue = interaction.options.getFocused();

  try {
    const transformations = await prisma.transformation.findMany({
      where: {
        guildId: interaction.guild.id,
        name: {
          contains: focusedValue
        }
      },
      select: {
        name: true
      },
      take: 25
    });

    await interaction.respond(
      transformations.map((t: { name: any; }) => ({
        name: t.name,
        value: t.name
      }))
    );
  } catch (error) {
    console.error('Error in autocomplete:', error);
    await interaction.respond([]);
  }
}