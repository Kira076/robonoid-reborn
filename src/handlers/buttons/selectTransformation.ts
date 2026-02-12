import { 
  ButtonInteraction, 
  StringSelectMenuBuilder, 
  ActionRowBuilder 
} from 'discord.js';
import { prisma } from '../../database.js';

export async function handleSelectTransformation(interaction: ButtonInteraction) {
  if (!interaction.guild) return;

  const transformations = await prisma.transformation.findMany({
    where: { guildId: interaction.guild.id },
    include: {
      _count: { select: { channelMappings: true } }
    }
  });

  if (transformations.length === 0) {
    await interaction.reply({
      content: 'No transformations saved yet! Use `/add-transformation` first.',
      ephemeral: true
    });
    return;
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('apply_transformation')
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
    content: 'Select a transformation to apply:',
    components: [row]
  });
}