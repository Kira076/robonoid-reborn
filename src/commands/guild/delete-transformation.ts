import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  PermissionFlagsBits,
  MessageFlags
} from 'discord.js';
import { prisma } from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('delete-transformation')
  .setDescription('Delete a saved transformation')
  .addStringOption(option =>
    option.setName('name')
      .setDescription('Name of the transformation to delete')
      .setRequired(true)
      .setAutocomplete(true)
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

  const name = interaction.options.getString('name', true);

  await interaction.deferReply({ flags: MessageFlags.Ephemeral, });

  try {
    // Check if transformation exists
    const transformation = await prisma.transformation.findUnique({
      where: {
        guildId_name: {
          guildId: interaction.guild.id,
          name: name
        }
      },
      include: {
        _count: {
          select: { channelMappings: true }
        }
      }
    });

    if (!transformation) {
      await interaction.editReply({
        content: `Transformation "${name}" not found!`
      });
      return;
    }

    // Delete the transformation (channelMappings will cascade delete)
    await prisma.transformation.delete({
      where: {
        id: transformation.id
      }
    });

    await interaction.editReply({
      content: `Deleted transformation **"${name}"** (${transformation._count.channelMappings} channel mappings removed)`
    });

  } catch (error) {
    console.error('Error deleting transformation:', error);
    await interaction.editReply({
      content: 'An error occurred while deleting the transformation.'
    });
  }
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