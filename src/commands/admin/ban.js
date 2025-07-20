const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const logModAction = require("../../utils/logModAction");

module.exports = {
  name: "ban",
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member")
    .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async executePrefix(msg) {
    const member = msg.mentions.members.first();
    if (!member) return msg.channel.send("Please mention a valid member.");
    if (member.id === msg.author.id) return msg.channel.send("You can't ban yourself.");
    if (member.id === msg.client.user.id) return msg.channel.send("You can't ban me.");

    await member.ban({ reason: "No reason" });
    msg.channel.send(`Banned ${member.user.tag}`);

    await logModAction({
      client: msg.client,
      guild: msg.guild,
      action: "Ban",
      target: member.user,
      moderator: msg.author,
      reason: "No reason"
    });
  },

  async executeSlash(i) {
    const member = i.options.getMember("user");
    if (!member) return i.reply({ content: "Invalid member.", ephemeral: true });
    if (member.id === i.user.id) return i.reply({ content: "You can't ban yourself.", ephemeral: true });
    if (member.id === i.client.user.id) return i.reply({ content: "You can't ban me.", ephemeral: true });

    await member.ban({ reason: "No reason" });
    await i.reply(`Banned ${member.user.tag}`);

    await logModAction({
      client: i.client,
      guild: i.guild,
      action: "Ban",
      target: member.user,
      moderator: i.user,
      reason: "No reason"
    });
  }
};
