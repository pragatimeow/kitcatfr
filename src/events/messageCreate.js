module.exports = {
  name: "messageCreate",
  async execute(_, message) {
    if (message.author.bot || !message.guild) return;
    const cfg = await message.client.prisma.guildConfig.findUnique({ where: { guildId: message.guild.id } });
    const prefix = cfg?.prefix || "!";
    if (!message.content.startsWith(prefix)) return;

    const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/);
    const command = message.client.commands.get(cmd);
    if (command?.executePrefix) command.executePrefix(message, args);
  }
};
