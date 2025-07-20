const {
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
      name: "queue",

  data: new SlashCommandBuilder().setName('queue').setDescription('Shows the current music queue'),

  async executeSlash(interaction) {
    const player = interaction.client.kazagumo.players.get(interaction.guild.id);
    if (!player || !player.queue.length) {
      return interaction.reply({ content: '❌ The queue is empty.', ephemeral: true });
    }

    await sendQueue(interaction, player);
  },

  async executePrefix(message) {
    const player = message.client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.length) {
      return message.channel.send('❌ The queue is empty.');
    }

    await sendQueue(message, player);
  },
};

async function sendQueue(ctx, player) {
  const tracks = player.queue;
  const queueLength = tracks.length;
  const max = 10;
  const pages = Math.ceil(queueLength / max);

  const getPageEmbed = (page) => {
    const start = (page - 1) * max;
    const currentTracks = tracks.slice(start, start + max);
    return new EmbedBuilder()
      .setTitle('🎶 Music Queue')
      .setColor('#2F3136')
      .setDescription(
        currentTracks
          .map((t, i) => `**${start + i + 1}.** [${t.title}](${t.uri}) \`[${msToTime(t.length)}]\` - *${t.requester.username}*`)
          .join('\n')
      )
      .setFooter({ text: `Page ${page} of ${pages}` });
  };

  const options = Array.from({ length: pages }, (_, i) =>
    new StringSelectMenuOptionBuilder().setLabel(`Page ${i + 1}`).setValue(`${i + 1}`)
  );

  const select = new StringSelectMenuBuilder()
    .setCustomId('queue_pages')
    .setPlaceholder('Select a page')
    .addOptions(options);

  const row = new ActionRowBuilder().addComponents(select);

  const replyFunc = ctx.reply ? ctx.reply.bind(ctx) : ctx.channel.send.bind(ctx.channel);
  const msg = await replyFunc({ embeds: [getPageEmbed(1)], components: [row] });

  const collector = msg.createMessageComponentCollector({
    filter: (i) => i.customId === 'queue_pages' && i.user.id === (ctx.user?.id || ctx.author?.id),
    time: 60_000,
  });

  collector.on('collect', async (i) => {
    const page = parseInt(i.values[0]);
    await i.update({ embeds: [getPageEmbed(page)] });
  });

  collector.on('end', () => {
    msg.edit({ components: [] }).catch(() => {});
  });
}

function msToTime(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
