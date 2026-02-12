import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  PermissionFlagsBits,
  MessageFlags
} from 'discord.js';
import { prisma } from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('rename-transformation')
  .setDescription('Rename a saved transformation')
  .addStringOption(option =>
    option.setName('current-name')
      .setDescription('Current name of the transformation')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .addStringOption(option =>
    option.setName('new-name')
      .setDescription('New name for the transformation')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ 
      content: 'This command can only be used in a server!', 
      flags: MessageFlags.Ephemeral, 
    });
    return;
  }

  const currentName = interaction.options.getString('current-name', true);
  const newName = interaction.options.getString('new-name', true);

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    // Check if current transformation exists
    const transformation = await prisma.transformation.findUnique({
      where: {
        guildId_name: {
          guildId: interaction.guild.id,
          name: currentName
        }
      }
    });

    if (!transformation) {
      await interaction.editReply({
        content: `Transformation "${currentName}" not found!`
      });
      return;
    }

    // Check if new name already exists
    const nameConflict = await prisma.transformation.findUnique({
      where: {
        guildId_name: {
          guildId: interaction.guild.id,
          name: newName
        }
      }
    });

    if (nameConflict) {
      await interaction.editReply({
        content: `A transformation named "${newName}" already exists! Please choose a different name.`
      });
      return;
    }

    // Update the name
    await prisma.transformation.update({
      where: {
        id: transformation.id
      },
      data: {
        name: newName
      }
    });

    await interaction.editReply({
      content: `Renamed transformation from **"${currentName}"** to **"${newName}"**`
    });

  } catch (error) {
    console.error('Error renaming transformation:', error);
    await interaction.editReply({
      content: 'An error occurred while renaming the transformation.'
    });
  }
}

export async function autocomplete(interaction: any) {
  if (!interaction.guild) return;

  const focusedOption = interaction.options.getFocused(true);
  
  // Only autocomplete for the current-name option
  if (focusedOption.name !== 'current-name') return;

  try {
    const transformations = await prisma.transformation.findMany({
      where: {
        guildId: interaction.guild.id,
        name: {
          contains: focusedOption.value
        }
      },
      select: {
        name: true
      },
      take: 25
    });

    await interaction.respond(
      transformations.map(t => ({
        name: t.name,
        value: t.name
      }))
    );
  } catch (error) {
    console.error('Error in autocomplete:', error);
    await interaction.respond([]);
  }
}