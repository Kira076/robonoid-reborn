import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction,
  EmbedBuilder 
} from 'discord.js';
import { prisma } from '../../database.js';

export const data = new SlashCommandBuilder()
  .setName('list-transformations')
  .setDescription('List all saved transformations')
  .addStringOption(option =>
    option.setName('name')
      .setDescription('Show details for a specific transformation')
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
    return;
  }

  const specificName = interaction.options.getString('name');

  try {
    if (specificName) {
      // Show details for specific transformation
      const transformation = await prisma.transformation.findUnique({
        where: {
          guildId_name: {
            guildId: interaction.guild.id,
            name: specificName
          }
        },
        include: {
          channelMappings: true
        }
      });

      if (!transformation) {
        await interaction.reply({
          content: `Transformation "${specificName}" not found!`,
          ephemeral: true
        });
        return;
      }

      const mappings = transformation.channelMappings.map((m: { channelId: string; newName: any; }) => {
        const channel = interaction.guild!.channels.cache.get(m.channelId);
        const currentName = channel?.name || 'Unknown Channel';
        return `<#${m.channelId}> (${currentName}) → **${m.newName}**`;
      }).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`Transformation: ${transformation.name}`)
        .setDescription(mappings || 'No channel mappings')
        .setColor(0x00AE86)
        .setFooter({ text: `${transformation.channelMappings.length} channels` });

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } else {
      // List all transformations
      const transformations = await prisma.transformation.findMany({
        where: {
          guildId: interaction.guild.id
        },
        include: {
          _count: {
            select: { channelMappings: true }
          }
        }
      });

      if (transformations.length === 0) {
        await interaction.reply({
          content: 'No transformations saved yet!',
          ephemeral: true
        });
        return;
      }

      const list = transformations.map((t: { name: any; _count: { channelMappings: any; }; }) => 
        `**${t.name}** - ${t._count.channelMappings} channels`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setTitle('Saved Transformations')
        .setDescription(list)
        .setColor(0x00AE86);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

  } catch (error) {
    console.error('Error listing transformations:', error);
    await interaction.reply({
      content: 'An error occurred while fetching transformations.',
      ephemeral: true
    });
  }
}