const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const path = require("path");
client.comands = new Discord.Collection();
const commandFiles = fs.readdirSync(path.join(__dirname,"/commands"))
.filter((filename) => filename.endsWith(".js"));

console.log(commandFiles);

client.on("ready", () =>
{
    console.log(`Estou Online!`);
    client.user.setActivity(`Sasuke<3`);

});

for(var filename of commandFiles)
{
  const command = requires(`./commands/${filename}`);

  client.commands.set(command.name,command);
}

console.log(client.command);


client.on("message", () =>{});



client.login(config.token);
