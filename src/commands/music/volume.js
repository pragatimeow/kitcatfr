const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "volume",
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set the playback volume (0 - 200)")
    .addIntegerOption(opt =>
      opt.setName("amount").setDescription("Volume amount").setRequired(true)
    ),

  async executePrefix(msg, args) {
    const player = msg.client.kazagumo.players.get(msg.guild.id);
    if (!player || !player.playing)
      return msg.channel.send({ embeds: [new EmbedBuilder().setColor("Red").setDescription("❌ Nothing is playing.")] });

    const vol = parseInt(args[0]);
    if (isNaN(vol) || vol < 0 || vol > 200)
      return msg.channel.send({ embeds: [new EmbedBuilder().setColor("Red").setDescription("Please provide a volume between **0** and **200**.")] });

    player.setVolume(vol);
    msg.channel.send({
      embeds: [new EmbedBuilder().setColor("Green").setDescription(`🔊 Volume set to **${vol}%**.`)],
    });
  },

  async executeSlash(i) {
    const player = i.client.kazagumo.players.get(i.guild.id);
    if (!player || !player.playing)
      return i.reply({ embeds: [new EmbedBuilder().setColor("Red").setDescription("❌ Nothing is playing.")], ephemeral: true });

    const vol = i.options.getInteger("amount");
    if (vol < 0 || vol > 200)
      return i.reply({ embeds: [new EmbedBuilder().setColor("Red").setDescription("Please provide a volume between **0** and **200**.")], ephemeral: true });

    player.setVolume(vol);
    i.reply({
      embeds: [new EmbedBuilder().setColor("Green").setDescription(`🔊 Volume set to **${vol}%**.`)],
    });
  },
};
