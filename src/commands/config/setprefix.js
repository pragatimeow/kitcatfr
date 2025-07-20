const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  name: "setprefix",
  data: new SlashCommandBuilder()
    .setName("setprefix")
    .setDescription("Set bot prefix")
    .addStringOption(o => o.setName("prefix").setDescription("New prefix").setRequired(true)),
  async executePrefix(msg, args) {
    const p = args[0];
    await msg.client.prisma.guildConfig.upsert({
      where: { guildId: msg.guild.id },
      update: { prefix: p },
      create: { guildId: msg.guild.id, prefix: p }
    });
    msg.channel.send(`Prefix set to \`${p}\``);
  },
  async executeSlash(i) {
    const p = i.options.getString("prefix");
    await i.client.prisma.guildConfig.upsert({
      where: { guildId: i.guild.id },
      update: { prefix: p },
      create: { guildId: i.guild.id, prefix: p }
    });
    i.reply(`Prefix set to \`${p}\``);
  }
};
