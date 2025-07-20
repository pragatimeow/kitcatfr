const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
module.exports = {
  name: "purge",
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete messages")
    .addIntegerOption(o => o.setName("count").setDescription("How many").setRequired(true).setMinValue(1).setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async executePrefix(msg, args) {
    const num = parseInt(args[0]);
    await msg.channel.bulkDelete(num, true);
    msg.channel.send(`Deleted ${num} messages`).then(m => setTimeout(() => m.delete(), 5000));
  },
  async executeSlash(i) {
    const num = i.options.getInteger("count");
    await i.channel.bulkDelete(num, true);
    i.reply({ content: `Deleted ${num} messages`, ephemeral: true });
  }
};
