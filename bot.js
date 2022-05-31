const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const search = require("yt-search");
const ytdl = require("ytdl-core-discord");

console.log("Estou vivo");
client.on("ready", () =>
{
    console.log(`Estou Online!`);
    client.user.setActivity(`Leonardo & Paloma <3`);

});
client.on("guildCreate", guild =>
{
    clonsole.log(`Estou no servidor: ${guild.name} (id: ${guild.id}. População: ${guild.memberCount}) Membros!`);
    client.user.setActivity(`Estou em ${client.guilds.size} servidores`);

});
client.on("guildDelete", guild =>
{
    console.log(`O bot foi removido em: ${client.name} (id: ${guild.id})`);
        client.user,setActivity(`Serving ${client.guilds.size} severs`);

});

client.on("message", async message => {

    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    if(!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const comando = args.shift().toLowerCase();
  if(comando === "ping") 
  {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! A Latência é ${m.createdTimestamp - message.createdTimestamp}ms. A Latencia da API é ${Math.round(client.ping)}ms`);
  }

  if(comando === "pedro")
  {
    const m = await message.channel.send("Pedro és tu?");
    m.edit("SUPERA PEDRINHO!!");
  }

  if(comando === "denis")
  {
    const m = await message.channel.send("Corno safado");
    m.edit("PÊNISVALDO VOLTANDO PARA EX EM 3,2,1!!");
  }
  if (comando === "patrocinio")
  {
    const m = await message.channel.send("olha a tristeza");
    m.edit("O TRISTE MAIS TRISTE!!!");
  }
  
  if (comando === "valdemir")
  {
    const m = await message.channel.send("olha o block");
    m.edit("Sendo bloqueado denovo por ser stalker!!!!!");
  }
  
  if (comando === "leonardo")
  {
    const m = await message.channel.send("Agora sou Pai");
    m.edit("Eu vou parar de beber!!");
  }
  
  if (comando === "bia")
  {
    const m = await message.channel.send("E-girl");
    m.edit("Trevosinha");
  }

 if(comando === "carlos")
 {
  const m = await message.channel.send("Rapido se esconde!!!");
  m.edit("Que foi rapa? tem ninguém embaixo da minha cama não.");
 }

 if(comando === "lucas")
 {
  const m = await message.channel.send("Partiu mandar um eu te amo de cara.");
  m.edit("Deu tudo errado!");
 }

 if (comando === "patrocinio2")
 {
   const m = await message.channel.send("Se nada deu errado, é porque não estou no time");
   
 }


});


client.login(config.token);

///////////////////////////////////////
const queue = new Map();

module.exports = {
    name: 'play',
    aliases: ['skip', 'stop'], //We are using aliases to run the skip and stop command follow this tutorial if lost: https://www.youtube.com/watch?v=QBUJ3cdofqc
    cooldown: 0,
    description: 'Advanced music bot',
    async execute(message,args, cmd, client, Discord)
    {


        //Checking for the voicechannel and permissions (you can add more permissions if you like).
        const voice_channel = message.member.voice.channel;
        if (!voice_channel) return message.channel.send('You need to be in a channel to execute this command!');
        const permissions = voice_channel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send('You dont have the correct permissins');
        if (!permissions.has('SPEAK')) return message.channel.send('You dont have the correct permissins');

        //This is our server queue. We are getting this server queue from the global queue.
        const server_queue = queue.get(message.guild.id);

        //If the user has used the play command
        if (cmd === 'play'){
            if (!args.length) return message.channel.send('You need to send the second argument!');
            let song = {};

            //If the first argument is a link. Set the song object to have two keys. Title and URl.
            if (ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0]);
                song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
            } else {
                //If there was no link, we use keywords to search for a video. Set the song object to have two keys. Title and URl.
                const video_finder = async (query) =>{
                    const video_result = await ytSearch(query);
                    return (video_result.videos.length > 1) ? video_result.videos[0] : null;
                }

                const video = await video_finder(args.join(' '));
                if (video){
                    song = { title: video.title, url: video.url }
                } else {
                     message.channel.send('Error finding video.');
                }
            }

            //If the server queue does not exist (which doesn't for the first video queued) then create a constructor to be added to our global queue.
            if (!server_queue){

                const queue_constructor = {
                    voice_channel: voice_channel,
                    text_channel: message.channel,
                    connection: null,
                    songs: []
                }
                
                //Add our key and value pair into the global queue. We then use this to get our server queue.
                queue.set(message.guild.id, queue_constructor);
                queue_constructor.songs.push(song);
    
                //Establish a connection and play the song with the vide_player function.
                try {
                    const connection = await voice_channel.join();
                    queue_constructor.connection = connection;
                    video_player(message.guild, queue_constructor.songs[0]);
                } catch (err) {
                    queue.delete(message.guild.id);
                    message.channel.send('There was an error connecting!');
                    throw err;
                }
            } else{
                server_queue.songs.push(song);
                return message.channel.send(`👍 **${song.title}** added to queue!`);
            }
        }

        else if(cmd === 'skip') skip_song(message, server_queue);
        else if(cmd === 'stop') stop_song(message, server_queue);
    }
    
}

const video_player = async (guild, song) => {
    const song_queue = queue.get(guild.id);

    //If no song is left in the server queue. Leave the voice channel and delete the key and value pair from the global queue.
    if (!song) {
        song_queue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    }
    const stream = ytdl(song.url, { filter: 'audioonly' });
    song_queue.connection.play(stream, { seek: 0, volume: 0.5 })
    .on('finish', () => {
        song_queue.songs.shift();
        video_player(guild, song_queue.songs[0]);
    });
    await song_queue.text_channel.send(`🎶 Now playing **${song.title}**`)
}

const skip_song = (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    if(!server_queue){
        return message.channel.send(`There are no songs in queue 😔`);
    }
    server_queue.connection.dispatcher.end();
}

const stop_song = (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    server_queue.songs = [];
    server_queue.connection.dispatcher.end();
}