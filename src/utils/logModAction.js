// src/utils/logModAction.js
const { EmbedBuilder } = require("discord.js");

async function logModAction({ client, guild, action, target, moderator, reason = "No reason provided" }) {
  const config = await client.prisma.guildConfig.findUnique({
    where: { guildId: guild.id }
  });

  if (!config?.modLog) return;

  const channel = guild.channels.cache.get(config.modLog);
  if (!channel?.isTextBased?.()) return;

  const embed = new EmbedBuilder()
    .setTitle(`🔨 ${action}`)
    .addFields(
      { name: "Target", value: `${target.tag} (${target.id})`, inline: true },
      { name: "Moderator", value: `${moderator.tag} (${moderator.id})`, inline: true },
      { name: "Reason", value: reason }
    )
    .setColor("Red")
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = logModAction;
