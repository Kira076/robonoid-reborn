import { 
  ButtonInteraction, 
  StringSelectMenuBuilder, 
  ActionRowBuilder, 
  MessageFlags
} from 'discord.js';
import { prisma } from '../../database.js';

export async function handleSelectTransformation(interaction: ButtonInteraction) {
  if (!interaction.guild) return;

  // Parse the updateDirectory flag from customId
  const updateDirectory = interaction.customId.split(':')[1] === 'true';

  const transformations = await prisma.transformation.findMany({
    where: { guildId: interaction.guild.id },
    include: {
      _count: { select: { channelMappings: true } }
    }
  });

  if (transformations.length === 0) {
    await interaction.reply({
      content: 'No transformations saved yet! Use `/add-transformation` first.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`apply_transformation:${updateDirectory}`)
    .setPlaceholder('Choose a transformation')
    .addOptions(
      transformations.map((t: { name: any; _count: { channelMappings: any; }; }) => ({
        label: t.name,
        description: `${t._count.channelMappings} channels`,
        value: t.name
      }))
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(selectMenu);

  await interaction.update({
    content: `Select a transformation to apply:${updateDirectory ? '\n*Directory will be updated*' : ''}`,
    components: [row]
  });
}