const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { PrismaClient } = require("@prisma/client");
const { Kazagumo } = require("kazagumo");
const { Connectors } = require("shoukaku");
const Spotify = require("kazagumo-spotify");
require("dotenv").config();
const Bottleneck = require("bottleneck");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});
client.limiter = new Bottleneck({
  minTime: 250, // minimum 250ms between requests (~4 per second)
  maxConcurrent: 1, // one request at a time
});
client.commands = new Collection();
client.slashCommands = new Collection();
client.prisma = new PrismaClient();

client.kazagumo = new Kazagumo(
  {
defaultSearchEngine: "youtube_music",
    plugins: [
      new Spotify({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        clients: [
          {
            id: process.env.SPOTIFY_CLIENT_ID,
            secret: process.env.SPOTIFY_CLIENT_SECRET,
          },
        ],
      }),
    ],
    send: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
    },
  },
  new Connectors.DiscordJS(client),
  [
    {
      name: "KitCat Node",
      url: `${process.env.LAVALINK_HOST}:${process.env.LAVALINK_PORT}`,
      auth: process.env.LAVALINK_PASSWORD,
    },
  ]
);
client.kazagumo.shoukaku.on('error', (name, error) => {
    console.error(`❌ Shoukaku error on node ${name}:`, error);
});

client.kazagumo.shoukaku.on('ready', (name, node) => {
    console.log(`✅ Shoukaku node '${name}' is ready to play music.`);
});

client.kazagumo.shoukaku.on('close', (name, code, reason) => {
    console.warn(`⚠️ Shoukaku node '${name}' closed. Code: ${code}, Reason: ${reason}`);
});

module.exports = client;
