const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "play",
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song or playlist from YouTube or Spotify")
    .addStringOption(o =>
      o.setName("query")
        .setDescription("Name or URL of the song/playlist")
        .setRequired(true)
    ),

  async executePrefix(msg, args) {
    const vc = msg.member.voice.channel;
    if (!vc) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#FF4444")
        .setDescription("🚫 **You need to join a voice channel first!**")
        .setFooter({ text: "Join a voice channel and try again" });
      return msg.channel.send({ embeds: [errorEmbed] });
    }

    const query = args.join(" ");
    const player = await msg.client.kazagumo.createPlayer({
      guildId: msg.guild.id,
      voiceId: vc.id,
      textId: msg.channel.id,
    });

    // Set up event listeners for this player if not already set
    this.setupPlayerEvents(msg.client, msg.guild.id, msg.channel.id);

    // Loading message
    const loadingEmbed = new EmbedBuilder()
      .setColor("#FFD700")
      .setDescription("🔍 **Searching for your music...**")
      .setFooter({ text: "This may take a few seconds" });
    
    const loadingMsg = await msg.channel.send({ embeds: [loadingEmbed] });

    const res = await msg.client.kazagumo.search(query, { requester: msg.author });
    
    if (!res.tracks.length) {
      const noResultsEmbed = new EmbedBuilder()
        .setColor("#FF4444")
        .setTitle("❌ No Results Found")
        .setDescription(`Sorry, I couldn't find anything for **"${query}"**`)
        .addFields({ name: "💡 Try:", value: "• Check your spelling\n• Use different keywords\n• Provide a direct URL" })
        .setFooter({ text: "Search tips" });
      return loadingMsg.edit({ embeds: [noResultsEmbed] });
    }

    if (res.type === "PLAYLIST") {
      const wasPlaying = player.playing;
      player.queue.add(res.tracks);
      
      if (!wasPlaying) {
        player.play();
        // Show now playing embed for first track after a short delay
        setTimeout(() => {
          if (player.track) {
            this.sendNowPlayingEmbed(player.track, msg.channel, msg.author, vc.name);
          }
        }, 1000);
      }

      const embed = new EmbedBuilder()
        .setColor("#1DB954")
        .setTitle("📃 Playlist Added Successfully!")
        .setDescription(`**${res.playlistName || "Untitled Playlist"}**`)
        .addFields(
          { name: "📊 Tracks Added", value: `\`${res.tracks.length}\` songs`, inline: true },
          { name: "🎵 Status", value: wasPlaying ? "Added to queue" : "Starting playback...", inline: true },
          { name: "📍 Voice Channel", value: `${vc.name}`, inline: true }
        )
        .setThumbnail(res.tracks[0]?.thumbnail || null)
        .setFooter({ 
          text: `Requested by ${msg.author.username} • Queue: ${player.queue.size} songs`, 
          iconURL: msg.author.displayAvatarURL() 
        })
        .setTimestamp();

      return loadingMsg.edit({ embeds: [embed] });
    } else {
      const track = res.tracks[0];
      const wasPlaying = player.playing;
      player.queue.add(track);
      
      if (!wasPlaying) player.play();

      const embed = new EmbedBuilder()
        .setColor(wasPlaying ? "#FF6B35" : "#1DB954")
        .setTitle(wasPlaying ? "➕ Added to Queue" : "▶️ Now Playing")
        .setDescription(`**[${track.title}](${track.uri})**`)
        .addFields(
          { name: "🎤 Artist", value: `\`${track.author || "Unknown Artist"}\``, inline: true },
          { name: "⏱️ Duration", value: `\`${formatDuration(track.length)}\``, inline: true },
          { name: "📍 Channel", value: `${vc.name}`, inline: true }
        )
        .setThumbnail(track.thumbnail || null)
        .setFooter({ 
          text: `Requested by ${msg.author.username} • Position in queue: ${player.queue.size}`, 
          iconURL: msg.author.displayAvatarURL() 
        })
        .setTimestamp();

      return loadingMsg.edit({ embeds: [embed] });
    }
  },

  async executeSlash(i) {
    const vc = i.member.voice.channel;
    if (!vc) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#FF4444")
        .setDescription("🚫 **You need to join a voice channel first!**")
        .setFooter({ text: "Join a voice channel and try again" });
      return i.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const q = i.options.getString("query");
    
    // Initial response with loading state
    const loadingEmbed = new EmbedBuilder()
      .setColor("#FFD700")
      .setDescription("🔍 **Searching for your music...**")
      .setFooter({ text: "This may take a few seconds" });
    
    await i.reply({ embeds: [loadingEmbed] });

    const player = await i.client.kazagumo.createPlayer({
      guildId: i.guild.id,
      voiceId: vc.id,
      textId: i.channel.id
    });

    // Set up event listeners for this player if not already set
    this.setupPlayerEvents(i.client, i.guild.id, i.channel.id);

    const res = await i.client.kazagumo.search(q, { requester: i.user });
    
    if (!res.tracks.length) {
      const noResultsEmbed = new EmbedBuilder()
        .setColor("#FF4444")
        .setTitle("❌ No Results Found")
        .setDescription(`Sorry, I couldn't find anything for **"${q}"**`)
        .addFields({ name: "💡 Try:", value: "• Check your spelling\n• Use different keywords\n• Provide a direct URL" })
        .setFooter({ text: "Search tips" });
      return i.editReply({ embeds: [noResultsEmbed] });
    }

    if (res.type === "PLAYLIST") {
      const wasPlaying = player.playing;
      player.queue.add(res.tracks);
      
      if (!wasPlaying) {
        player.play();
        // Show now playing embed for first track after a short delay
        setTimeout(() => {
          if (player.track) {
            this.sendNowPlayingEmbed(player.track, i.channel, i.user, vc.name);
          }
        }, 1000);
      }

      const embed = new EmbedBuilder()
        .setColor("#1DB954")
        .setTitle("📃 Playlist Added Successfully!")
        .setDescription(`**${res.playlistName || "Untitled Playlist"}**`)
        .addFields(
          { name: "📊 Tracks Added", value: `\`${res.tracks.length}\` songs`, inline: true },
          { name: "🎵 Status", value: wasPlaying ? "Added to queue" : "Starting playback...", inline: true },
          { name: "📍 Voice Channel", value: `${vc.name}`, inline: true }
        )
        .setThumbnail(res.tracks[0]?.thumbnail || null)
        .setFooter({ 
          text: `Requested by ${i.user.username} • Queue: ${player.queue.size} songs`, 
          iconURL: i.user.displayAvatarURL() 
        })
        .setTimestamp();

      return i.editReply({ embeds: [embed] });
    } else {
      const track = res.tracks[0];
      const wasPlaying = player.playing;
      player.queue.add(track);
      
      if (!wasPlaying) player.play();

      const embed = new EmbedBuilder()
        .setColor(wasPlaying ? "#FF6B35" : "#1DB954")
        .setTitle(wasPlaying ? "➕ Added to Queue" : "▶️ Now Playing")
        .setDescription(`**[${track.title}](${track.uri})**`)
        .addFields(
          { name: "🎤 Artist", value: `\`${track.author || "Unknown Artist"}\``, inline: true },
          { name: "⏱️ Duration", value: `\`${formatDuration(track.length)}\``, inline: true },
          { name: "📍 Channel", value: `${vc.name}`, inline: true }
        )
        .setThumbnail(track.thumbnail || null)
        .setFooter({ 
          text: `Requested by ${i.user.username} • Position in queue: ${player.queue.size}`, 
          iconURL: i.user.displayAvatarURL() 
        })
        .setTimestamp();

      return i.editReply({ embeds: [embed] });
    }
  },

  // Set up event listeners for player events
  setupPlayerEvents(client, guildId, channelId) {
    // Check if we already have listeners set up for this guild
    if (!client.kazagumoListeners) {
      client.kazagumoListeners = new Set();
    }
    
    if (client.kazagumoListeners.has(guildId)) return;
    client.kazagumoListeners.add(guildId);

    // Listen for track start events on the Kazagumo manager
    client.kazagumo.on('playerStart', (player, track) => {
      if (player.guildId !== guildId) return;
      
      const channel = client.channels.cache.get(channelId);
      if (!channel) return;

      const vc = player.voiceId ? 
        channel.guild.channels.cache.get(player.voiceId) : 
        channel.guild.me.voice.channel;
      
      this.sendNowPlayingEmbed(track, channel, track.requester, vc?.name || 'Unknown');
    });
  },

  // Helper method to send now playing embed
  sendNowPlayingEmbed(track, channel, requester, vcName) {
    const embed = new EmbedBuilder()
      .setColor("#1DB954")
      .setTitle("▶️ Now Playing")
      .setDescription(`**[${track.title}](${track.uri})**`)
      .addFields(
        { name: "🎤 Artist", value: `\`${track.author || "Unknown Artist"}\``, inline: true },
        { name: "⏱️ Duration", value: `\`${formatDuration(track.length)}\``, inline: true },
        { name: "📍 Channel", value: `${vcName}`, inline: true }
      )
      .setThumbnail(track.thumbnail || null)
      .setFooter({ 
        text: `Requested by ${requester.username}`, 
        iconURL: requester.displayAvatarURL() 
      })
      .setTimestamp();

    channel.send({ embeds: [embed] }).catch(console.error);
  }
};

function formatDuration(ms) {
  if (!ms || ms === 0) return "Live";
  
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, "0");
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds}`;
  }
  return `${minutes}:${seconds}`;
}