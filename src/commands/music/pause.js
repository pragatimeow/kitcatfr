const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  name: "pause",
  data: new SlashCommandBuilder().setName("pause").setDescription("Pause playback"),

  async executePrefix(msg) {
    const player = msg.client.kazagumo.players.get(msg.guild.id);
    if (!player || !player.playing) return msg.channel.send("Nothing is playing.");

    player.pause(true);
    msg.channel.send("⏸️ Paused the music.");
  },

  async executeSlash(i) {
    const player = i.client.kazagumo.players.get(i.guild.id);
    if (!player || !player.playing) return i.reply({ content: "Nothing is playing.", ephemeral: true });

    player.pause(true);
    i.reply("⏸️ Paused the music.");
  },
};
