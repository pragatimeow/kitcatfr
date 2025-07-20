const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "resume",
  data: new SlashCommandBuilder().setName("resume").setDescription("Resume playback"),

  async executePrefix(msg) {
    const player = msg.client.kazagumo.players.get(msg.guild.id);
    if (!player || player.playing) return msg.channel.send("Nothing to resume.");

    player.pause(false);
    msg.channel.send("▶️ Resumed the music.");
  },

  async executeSlash(i) {
    const player = i.client.kazagumo.players.get(i.guild.id);
    if (!player || player.playing) return i.reply({ content: "Nothing to resume.", ephemeral: true });

    player.pause(false);
    i.reply("▶️ Resumed the music.");
  },
};
