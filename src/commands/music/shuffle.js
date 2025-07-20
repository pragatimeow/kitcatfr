const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "shuffle",
  data: new SlashCommandBuilder().setName("shuffle").setDescription("Shuffle the current queue"),

  async executePrefix(msg) {
    const player = msg.client.kazagumo.players.get(msg.guild.id);
    if (!player || !player.playing || player.queue.length < 2) {
      return msg.channel.send({
        embeds: [new EmbedBuilder().setColor("Red").setDescription("❌ Not enough tracks to shuffle.")],
      });
    }

    player.queue = player.queue.sort(() => Math.random() - 0.5);

    msg.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("Yellow")
          .setDescription(`🔀 **Queue shuffled!** (${player.queue.length} tracks)`),
      ],
    });
  },

  async executeSlash(i) {
    const player = i.client.kazagumo.players.get(i.guild.id);
    if (!player || !player.playing || player.queue.length < 2) {
      return i.reply({
        embeds: [new EmbedBuilder().setColor("Red").setDescription("❌ Not enough tracks to shuffle.")],
        ephemeral: true,
      });
    }

    player.queue = player.queue.sort(() => Math.random() - 0.5);

    i.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Yellow")
          .setDescription(`🔀 **Queue shuffled!** (${player.queue.length} tracks)`),
      ],
    });
  },
};
