require("dotenv").config();
const http = require("http");
const client = require("./client");
const fs = require("fs");
const path = require("path");
const deployCommands = require("./utils/deployCommands");

// Create a web server
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is alive!");
}).listen(process.env.PORT || 3000, () => {
  console.log("Web server running on port " + (process.env.PORT || 3000));
});

// Events
fs.readdirSync(path.join(__dirname, "../src/events")).forEach(file => {
  const evt = require(`../src/events/${file}`);
  if (evt.once) client.once(evt.name, (...a) => evt.execute(client, ...a));
  else client.on(evt.name, (...a) => evt.execute(client, ...a));
});

// Commands
const cmdDirs = fs.readdirSync(path.join(__dirname, "../src/commands"));
for (const dir of cmdDirs) {
  fs.readdirSync(path.join(__dirname, `../src/commands/${dir}`))
    .filter(f => f.endsWith(".js"))
    .forEach(file => {
      const cmd = require(`../src/commands/${dir}/${file}`);
      if (cmd.name) client.commands.set(cmd.name, cmd);
      if (cmd.data) client.slashCommands.set(cmd.data.name, cmd);
    });
}

// Deploy slash commands once bot is ready
client.once("ready", async () => {
  await deployCommands(client);
});

client.login(process.env.TOKEN);
