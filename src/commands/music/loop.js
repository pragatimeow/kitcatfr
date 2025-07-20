const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "loop",
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Set loop mode")
    .addStringOption(opt =>
      opt
        .setName("mode")
        .setDescription("Loop mode")
        .setRequired(true)
        .addChoices(
          { name: "Off", value: "off" },
          { name: "Track", value: "track" },
          { name: "Queue", value: "queue" }
        )
    ),

  async executePrefix(msg, args) {
    const player = msg.client.kazagumo.players.get(msg.guild.id);
    if (!player || !player.playing)
      return msg.channel.send({ embeds: [new EmbedBuilder().setColor("Red").setDescription("❌ Nothing is playing.")] });

    const mode = args[0]?.toLowerCase();
    const loopModes = { off: 0, track: 1, queue: 2 };
    if (!loopModes.hasOwnProperty(mode))
      return msg.channel.send({ embeds: [new EmbedBuilder().setColor("Red").setDescription("Usage: `loop [off|track|queue]`")] });

    player.setLoop(loopModes[mode]);
    msg.channel.send({
      embeds: [new EmbedBuilder().setColor("Blurple").setDescription(`🔁 Loop mode set to **${mode}**.`)],
    });
  },

  async executeSlash(i) {
    const player = i.client.kazagumo.players.get(i.guild.id);
    if (!player || !player.playing)
      return i.reply({ embeds: [new EmbedBuilder().setColor("Red").setDescription("❌ Nothing is playing.")], ephemeral: true });

    const mode = i.options.getString("mode");
    const loopModes = { off: 0, track: 1, queue: 2 };

    player.setLoop(loopModes[mode]);
    i.reply({
      embeds: [new EmbedBuilder().setColor("Blurple").setDescription(`🔁 Loop mode set to **${mode}**.`)],
    });
  },
};
