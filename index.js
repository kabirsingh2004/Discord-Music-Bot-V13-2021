const Discord = require("discord.js");
const Distube = require("distube").default;
const config = require("./config.json");
const client = new Discord.Client({
  intents: 641,
});

const distube = new Distube(client, {
  emitNewSongOnly: false,
  searchSongs: 0,
});

client.on("ready", () => {
  console.log(`Your Music is Playing...`);
  client.user.setActivity("Your Songs", { type: "PLAYING" });
});

const status = (queue) =>
  `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"
  }\` | Loop: \`${queue.repeatMode
    ? queue.repeatMode == 2
      ? "All Queue"
      : "This Song"
    : "Off"
  }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

// distube events
distube.on("playSong", (queue, song) => {
  let playembed = new Discord.MessageEmbed()
    .setColor("BLURPLE")
    .setTitle(`🎵 Playing `)
    .setThumbnail(song.thumbnail)
    .setDescription(`[${song.name}](${song.url})`)
    .addField("Requested By", `${song.user}`, true)
    .addField("Duration", `${song.formattedDuration.toString()}`, true)
    .setFooter(status(queue), song.user.displayAvatarURL({ dynamic: true }));
  queue.textChannel.send({ embeds: [playembed] });
});
distube.on("addSong", (queue, song) => {
  let playembed = new Discord.MessageEmbed()
    .setColor("BLURPLE")
    .setTitle(`🎵 Added to Queue `)
    .setThumbnail(song.thumbnail)
    .setDescription(`[${song.name}](${song.url})`)
    .addField("Requested By", `${song.user}`, true)
    .addField("Duration", `${song.formattedDuration.toString()}`, true)
    .setFooter(
      `Coded By Kabir Singh`,
      song.user.displayAvatarURL({ dynamic: true })
    );

  queue.textChannel.send({ embeds: [playembed] });
});
distube.on('addList', (queue, plalist) => {
  let playembed = new Discord.MessageEmbed()
    .setColor("BLURPLE")
    .setTitle(`🎵 PlayList Added to Queue `)
    .setThumbnail(plalist.thumbnail)
    .setDescription(`[${plalist.name}](${plalist.url})`)
    .addField("Requested By", `${plalist.user}`, true)
    .addField("Duration", `${plalist.formattedDuration.toString()}`, true)
    .setFooter(
      `Coded By Kabir Singh`,
      plalist.user.displayAvatarURL({ dynamic: true })
    );

  queue.textChannel.send({ embeds: [playembed] });
})
client.on("messageCreate", async (message) => {
  if (
    !message.guild ||
    message.author.bot ||
    !message.content.startsWith(config.prefix)
  )
    return;

  let args = message.content.slice(config.prefix.length).trim().split(" ");
  let cmd = args.shift()?.toLowerCase();
  if (cmd === "ping") {
    message.channel.send(`>>> Ping :- \`${client.ws.ping}\``);
  }
  else if (cmd === "play") {
    let search = args.join(" ");
    let channel = message.member.voice.channel;
    let queue = distube.getQueue(message.guildId);
    if (!channel) {
      return message.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setColor("BLURPLE")
            .setDescription(`>>> Please Join a Voice Channel`)
            .setFooter(
              `Coded By Kabir Singh`,
              message.author.displayAvatarURL({ dynamic: true })
            ),
        ],
      });
    }
    // if (message.guild.me.voice.channel !== channel) {
    //   return message.reply({
    //     embeds: [
    //       new Discord.MessageEmbed()
    //         .setColor("BLURPLE")
    //         .setDescription(`>>> Please Join My Voice Channel to Play Song`)
    //         .setFooter(
    //           `Coded By Kabir Singh`,
    //           message.author.displayAvatarURL({ dynamic: true })
    //         ),
    //     ],
    //   });
    // }
    if (!search) {
      return message.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setColor("BLURPLE")
            .setDescription(`>>> Please Provide me Song name or Link`)
            .setFooter(
              `Coded By Kabir Singh`,
              message.author.displayAvatarURL({ dynamic: true })
            ),
        ],
      });
    }
    distube.play(message, search);
  } else if (cmd === "skip") {
    let queue = distube.getQueue(message.guild.id);
    let channel = message.member.voice.channel;
    if (!channel) {
      return message.channel.send(`** You need to Join Voice Channel **`)
    }
    if (!queue) {
      return message.channel.send(`** Nothing Playing **`)
    }
    queue.skip();
    message.channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setColor("BLURPLE")
          .setTitle(`Song Skiped`)
          .setDescription(`Song Changed by ${message.author}`)
          .setFooter(`Coded by Kabir Singh`)
      ]
    })

  } else if (cmd === 'pause') {
    let queue = distube.getQueue(message.guild.id);
    let channel = message.member.voice.channel;
    if (!channel) {
      return message.channel.send(`** You need to Join Voice Channel **`)
    }
    if (!queue.songs.length) {
      return message.channel.send(`** Nothing Playing **`)
    }
    queue.pause()
    message.channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setColor("BLURPLE")
          .setTitle(`Song Pause`)
          .setDescription(`Song Paushed by ${message.author}`)
          .setFooter(`Coded by Kabir Singh`)
      ]
    })
  } else if (cmd === 'resume') {
    let queue = distube.getQueue(message.guild.id);
    let channel = message.member.voice.channel;
    if (!channel) {
      return message.channel.send(`** You need to Join Voice Channel **`)
    }
    if (!queue.songs.length) {
      return message.channel.send(`** Nothing Playing **`)
    }
    queue.resume()
    message.channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setColor("BLURPLE")
          .setTitle(`Song Resume`)
          .setDescription(`Song Resumed by ${message.author}`)
          .setFooter(`Coded by Kabir Singh`)
      ]
    })
  } else if (cmd === "queue") {
    let queue = distube.getQueue(message.guild.id);
    let channel = message.member.voice.channel;
    if (!channel) {
      return message.channel.send(`** You need to Join Voice Channel **`)
    }
    if (!queue.songs.length) {
      return message.channel.send(`** Nothing Playing **`)
    }
    if (queue.playing) {
      let embedsc = queue.songs.map((song, index) => {
        return `${index + 1} [${song.name}](${song.url}) \`[${song.formattedDuration}]\``
      })

      message.channel.send({
        embeds: [
          new Discord.MessageEmbed()
            .setColor('BLURPLE')
            .setTitle(`Queue Of \`${message.guild.name}\``)
            .setDescription(`>>> ${embedsc.join("\n")}`.substr(0, 3000))
            .setFooter(`${queue.songs.length} Songs`, message.guild.iconURL({ dynamic: true }))
        ]
      })

    }
  } else if (cmd === "np") {
    let queue = distube.getQueue(message.guild.id);
    if (!queue.songs.length) {
      return message.channel.send(`** Nothing Playing **`)
    }
    let song = queue.songs[0];
    let embed = new Discord.MessageEmbed()
      .setAuthor(`Now Playing`, song.thumbnail)
      .setColor('BLURPLE')
      .setTitle(song.name)
      .setURL(song.url)
      .setThumbnail(song.thumbnail)
      .addFields([
        {
          name: "**Duration**",
          value: `>>> ${song.formattedDuration.toString()}`,
          inline: true
        },
        {
          name: "**User**",
          value: `>>> ${song.user}`,
          inline: true
        },
        {
          name: "**Views**",
          value: `>>> ${song.views.toLocaleString()}`,
          inline: true
        }
      ])

    message.channel.send({ embeds: [embed] })
  }
});
client.login(config.token);

