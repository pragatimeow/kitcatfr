const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const logModAction = require("../../utils/logModAction");

module.exports = {
  name: "kick",
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member")
    .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async executePrefix(msg, args) {
    const member = msg.mentions.members.first();
    if (!member) return msg.channel.send("Please mention a valid member.");
    if (member.id === msg.author.id) return msg.channel.send("You can't kick yourself.");
    if (member.id === msg.client.user.id) return msg.channel.send("You can't kick me.");

    const reason = args.slice(1).join(" ") || "No reason";
    await member.kick(reason);
    msg.channel.send(`Kicked ${member.user.tag}`);

    await logModAction({
      client: msg.client,
      guild: msg.guild,
      action: "Kick",
      target: member.user,
      moderator: msg.author,
      reason
    });
  },

  async executeSlash(i) {
    const member = i.options.getMember("user");
    if (!member) return i.reply({ content: "Invalid member.", ephemeral: true });
    if (member.id === i.user.id) return i.reply({ content: "You can't kick yourself.", ephemeral: true });
    if (member.id === i.client.user.id) return i.reply({ content: "You can't kick me.", ephemeral: true });

    await member.kick("No reason");
    await i.reply(`Kicked ${member.user.tag}`);

    await logModAction({
      client: i.client,
      guild: i.guild,
      action: "Kick",
      target: member.user,
      moderator: i.user,
      reason: "No reason"
    });
  }
};
