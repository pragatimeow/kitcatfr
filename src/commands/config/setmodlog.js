const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  name: "setmodlog",
  data: new SlashCommandBuilder()
    .setName("setmodlog")
    .setDescription("Set mod-log channel")
    .addChannelOption(o => o.setName("channel").setDescription("Channel").setRequired(true)),
  async executePrefix(msg) {
    const ch = msg.mentions.channels.first();
    await msg.client.prisma.guildConfig.upsert({
      where: { guildId: msg.guild.id },
      update: { modLog: ch.id },
      create: { guildId: msg.guild.id, modLog: ch.id }
    });
    msg.channel.send(`Mod-log set to ${ch}`);
  },
  async executeSlash(i) {
    const ch = i.options.getChannel("channel");
    await i.client.prisma.guildConfig.upsert({
      where: { guildId: i.guild.id },
      update: { modLog: ch.id },
      create: { guildId: i.guild.id, modLog: ch.id }
    });
    i.reply(`Mod-log set to ${ch}`);
  }
};
