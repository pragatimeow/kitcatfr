// src/utils/deployCommands.js
const { REST, Routes } = require('discord.js');

async function deployCommands(client) {
    const slashCommands = [];

    for (const [name, cmd] of client.commands) {
        if (cmd.data) slashCommands.push(cmd.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log(`📤 Deploying ${slashCommands.length} slash commands...`);
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: slashCommands }
        );
        console.log('✅ Successfully deployed slash commands.');
    } catch (err) {
        console.error('❌ Failed to deploy slash commands:', err);
    }
}

module.exports = deployCommands; // ✅ export the function directly
