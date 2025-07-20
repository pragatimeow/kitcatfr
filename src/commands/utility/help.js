const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "help",
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("📚 Discover all the amazing features this bot has to offer!")
        .addStringOption(option =>
            option.setName("category")
                .setDescription("View commands from a specific category")
                .setRequired(false)
        ),
    
  async executePrefix(msg) {
  const cfg = await msg.client.prisma.guildConfig.findUnique({
    where: { guildId: msg.guild.id }
  });

  const prefix = cfg?.prefix || "!";

  const { embed, components } = await genHelp(msg.client, prefix); // pass prefix here
  const response = await msg.channel.send({ embeds: [embed], components });

  const collector = response.createMessageComponentCollector({ time: 300000 });

  collector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) {
      return interaction.reply({ content: "❌ This help menu is not for you!", ephemeral: true });
    }
    await handleInteraction(interaction, msg.client, prefix); // pass prefix to interaction handler
  });

  collector.on('end', () => {
    response.edit({ components: [] }).catch(() => {});
  });
}
};

async function genHelp(client) {
    const categories = await getCategories();
    const totalCommands = await getTotalCommands();
    
    const embed = new EmbedBuilder()
        .setTitle("🎯 KitCat HQ")
        .setColor("#00D4FF") // Bright cyan color
        .setDescription(`
        **Welcome to the Kitcat!** 🚀
        
        🔥 **${totalCommands} powerful commands** across **${categories.length} categories**
        ⚡ **Lightning fast** responses and **premium features**
        
        **Choose a category below to explore:**
        `)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setTimestamp()
        .setFooter({ 
            text: `${client.user.username} • Making Discord better, one command at a time!`,
            iconURL: client.user.displayAvatarURL({ dynamic: true })
        });

    // Add category preview with emojis
    const categoryEmojis = {
        'admin': '<:Admin:1396005309864218624>',
        'moderation': '🔨',
        'fun': '🎉',
        'utility': '<:utility:1396005589431222304>',
        'music': '<:music:1396005514667626578>',
        'economy': '💰',
        'games': '🎮',
        'info': 'ℹ️',
        'config': '<:config:1396005380752146514>',
        'misc': '📦'
    };

    let categoryPreview = "";
    for (const cat of categories.slice(0, 6)) { // Show first 6 categories
        const emoji = categoryEmojis[cat.name.toLowerCase()] || '';
        categoryPreview += `${emoji} **${cat.name}** • ${cat.commandCount} commands\n`;
    }
    
    if (categories.length > 6) {
        categoryPreview += `\n*And ${categories.length - 6} more categories...*`;
    }

    embed.addFields({
        name: "<:a_categories:1396005466068226143> Quick Overview",
        value: categoryPreview,
        inline: false
    });

    // Create interactive components
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_category_select')
        .setPlaceholder('🔍 Select a category to explore...')
        .setMinValues(1)
        .setMaxValues(1);

    categories.forEach(cat => {
        const emoji = categoryEmojis[cat.name.toLowerCase()] || '📁';
        selectMenu.addOptions({
            label: `${cat.name} (${cat.commandCount} commands)`,
            description: `View all ${cat.name.toLowerCase()} commands`,
            value: cat.name,
            emoji: emoji
        });
    });

    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('help_refresh')
                .setLabel('Refresh')
                .setEmoji('<:refresh:1396005885687365723>')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('help_support')
                .setLabel('Support')
                .setEmoji('<:support:1396005935310180482>')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('help_invite')
                .setLabel('Invite Bot')
                .setEmoji('<a:invite:1396005715021266954>')
                .setStyle(ButtonStyle.Success)
        );

    const selectRow = new ActionRowBuilder().addComponents(selectMenu);

    return {
        embed,
        components: [selectRow, buttons]
    };
}

async function genCategoryHelp(client, categoryName, prefix="!") {
    const categoryPath = path.join(__dirname, `../${categoryName}`);

    if (!fs.existsSync(categoryPath)) {
        return new EmbedBuilder()
            .setTitle("❌ Category Not Found")
            .setColor("#FF0000")
            .setDescription(`The category **${categoryName}** doesn't exist!`)
            .setTimestamp();
    }

    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith(".js"));
    const commands = [];

    for (const file of files) {
        try {
            const command = require(`../${categoryName}/${file}`);
            if (command.name) {
                commands.push({
                    name: command.name,
                    description: command.data?.description || "No description available"
                });
            }
        } catch (error) {
            console.error(`Error loading command ${file}:`, error);
        }
    }

     const categoryEmojis = {
        'admin': '<:Admin:1396005309864218624>',
        'moderation': '🔨',
        'fun': '🎉',
        'utility': '<:utility:1396005589431222304>',
        'music': '<:music:1396005514667626578>',
        'economy': '💰',
        'games': '🎮',
        'info': 'ℹ️',
        'config': '<:config:1396005380752146514>',
        'misc': '📦'
    };


    const emoji = categoryEmojis[categoryName.toLowerCase()] || '📁';
    
    const embed = new EmbedBuilder()
        .setTitle(`${emoji} ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Commands`)
        .setColor("#00D4FF")
        .setDescription(`**${commands.length} commands** in this category\n\n`)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ 
            text: `Use /help to see all categories`,
            iconURL: client.user.displayAvatarURL({ dynamic: true })
        });

    // Group commands in a nice format
    let commandList = "";
    commands.forEach((cmd, index) => {
        commandList += `**\`/${cmd.name}\`** | **\`${prefix}${cmd.name}\`** - ${cmd.description}\n`;        
        // Add field every 10 commands to prevent embed limit issues
        if ((index + 1) % 10 === 0 || index === commands.length - 1) {
            embed.addFields({
                name: index < 10 ? "Commands:" : "\u200B",
                value: commandList,
                inline: false
            });
            commandList = "";
        }
    });

    return embed;
}

async function getCategories() {
    const cats = fs.readdirSync(path.join(__dirname, ".."));
    const categories = [];
    
    for (const cat of cats) {
        const catPath = path.join(__dirname, `../${cat}`);
        if (fs.statSync(catPath).isDirectory()) {
            const files = fs.readdirSync(catPath).filter(f => f.endsWith(".js"));
            categories.push({
                name: cat,
                commandCount: files.length
            });
        }
    }
    
    return categories;
}

async function getTotalCommands() {
    const cats = fs.readdirSync(path.join(__dirname, ".."));
    let total = 0;
    
    for (const cat of cats) {
        const catPath = path.join(__dirname, `../${cat}`);
        if (fs.statSync(catPath).isDirectory()) {
            const files = fs.readdirSync(catPath).filter(f => f.endsWith(".js"));
            total += files.length;
        }
    }
    
    return total;
}

async function handleInteraction(interaction, client, prefix = "!") {
  if (interaction.isStringSelectMenu()) {
    await interaction.deferReply({ ephemeral: true }); // Acknowledge early
    const category = interaction.values[0];
    const categoryEmbed = await genCategoryHelp(client, category, prefix);
    await interaction.editReply({ embeds: [categoryEmbed] });
  } else if (interaction.isButton()) {
    // For buttons, you can also defer or update quickly
    switch (interaction.customId) {
      case 'help_refresh':
        const { embed, components } = await genHelp(client);
        await interaction.update({ embeds: [embed], components });
        break;
      case 'help_support':
        await interaction.deferReply({ ephemeral: true });
        const supportEmbed = new EmbedBuilder()
          .setTitle("💬 Need Help?")
          .setColor("#00D4FF")
          .setDescription("Join our support server for help and updates!")
          .addFields({
            name: "Support Server",
            value: "[Click here to join](https://discord.gg/FXu6BRDtdz)",
            inline: true
          })
          .setTimestamp();
        await interaction.editReply({ embeds: [supportEmbed] });
        break;
      case 'help_invite':
        await interaction.deferReply({ ephemeral: true });
        const inviteEmbed = new EmbedBuilder()
          .setTitle("➕ Invite Me!")
          .setColor("#00FF00")
          .setDescription("Add me to your server and unlock amazing features!")
          .addFields({
            name: "Invite Link",
            value: "[Click here to invite](https://discord.com/api/oauth2/authorize?client_id=1395391939419050176&permissions=8&scope=bot%20applications.commands)",
            inline: true
          })
          .setTimestamp();
        await interaction.editReply({ embeds: [inviteEmbed] });
        break;
    }
  }
}
