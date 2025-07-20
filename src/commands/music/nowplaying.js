const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "nowplaying",
  aliases: ["np"],
  description: "Shows the song currently playing",

  async executePrefix(message) {
    const player = message.client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue || !player.queue.current)
      return message.channel.send("❌ Nothing is playing right now.");

    const current = player.queue.current;

    const embed = new EmbedBuilder()
      .setColor("#1DB954")
      .setTitle("🎶 Now Playing")
      .setDescription(`[${current.title}](${current.uri})`)
      .setThumbnail(current.thumbnail || null)
      .addFields(
        { name: "🎤 Artist", value: current.author || "Unknown", inline: true },
        { name: "⏱ Duration", value: formatDuration(current.length), inline: true },
        { name: "🙋 Requested by", value: `${current.requester}`, inline: true }
      );

    return message.channel.send({ embeds: [embed] });
  },

  async executeSlash(interaction) {
    const player = interaction.client.kazagumo.players.get(interaction.guild.id);
    if (!player || !player.queue || !player.queue.current)
      return interaction.reply({ content: "❌ Nothing is playing right now.", ephemeral: true });

    const current = player.queue.current;

    const embed = new EmbedBuilder()
      .setColor("#1DB954")
      .setTitle("🎶 Now Playing")
      .setDescription(`[${current.title}](${current.uri})`)
      .setThumbnail(current.thumbnail || null)
      .addFields(
        { name: "🎤 Artist", value: current.author || "Unknown", inline: true },
        { name: "⏱ Duration", value: formatDuration(current.length), inline: true },
        { name: "🙋 Requested by", value: `${current.requester}`, inline: true }
      );

    return interaction.reply({ embeds: [embed] });
  },
};

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
