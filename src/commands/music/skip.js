const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "skip",
  data: new SlashCommandBuilder().setName("skip").setDescription("Skip the current track"),

async executePrefix(msg) {
  const player = msg.client.kazagumo.players.get(msg.guild.id);
   if (!player || !player.queue || !player.queue.current)
      return message.channel.send("❌ Nothing is playing right now.");

  await player.skip();

  setTimeout(() => {
    const next = player.queue.current;
    if (next) {
      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("🎶 Now Playing")
        .setDescription(`[${next.title}](${next.uri})`)
        .addFields(
          { name: "👤 Author", value: String(next.author ?? "Unknown"), inline: true },
          { name: "⏱️ Duration", value: formatDuration(next.length), inline: true },
        )
        .setThumbnail(next.thumbnail)
        .setFooter({ text: `Requested by ${next.requester?.username || "Unknown"}` });

      msg.channel.send({ content: "⏭️ Skipped!", embeds: [embed] });
    } else {
      msg.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Yellow")
            .setDescription("⏭️ Skipped the track.\n🚫 No more songs in the queue."),
        ],
      });
    }
  }, 500); // Give time for player.current to update
},

async executeSlash(i) {
  const player = i.client.kazagumo.players.get(i.guild.id);
  if (!player) {
    return i.reply({
      embeds: [new EmbedBuilder().setColor("Red").setDescription("❌ Nothing is playing.")],
      ephemeral: true,
    });
  }

  await player.skip();

  setTimeout(() => {
    const next = player.current;
    if (next) {
      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("🎶 Now Playing")
        .setDescription(`[${next.title}](${next.uri})`)
        .addFields(
          { name: "👤 Author", value: String(next.author ?? "Unknown"), inline: true },
          { name: "⏱️ Duration", value: String(next.lengthFormatted ?? "Unknown"), inline: true },
        )
        .setThumbnail(next.thumbnail)
        .setFooter({ text: `Requested by ${next.requester?.username || "Unknown"}` });

      i.reply({ content: "⏭️ Skipped!", embeds: [embed] });
    } else {
      i.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Yellow")
            .setDescription("⏭️ Skipped the track.\n🚫 No more songs in the queue."),
        ],
      });
    }
  }, 500);
},

};
function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
