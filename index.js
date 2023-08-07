const log = require("./src/log")

require("dotenv").config()
const Discord = require("discord.js")

const { GatewayIntentBits } = Discord
const client = new Discord.Client({ intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates
]})

if (process.env.DISCORD_TOKEN == undefined) {
    console.log("[error] no DISCORD_TOKEN environment variable provided")
    process.exit(1)
}
const discordToken = process.env.DISCORD_TOKEN

client.on("ready", () => {
    console.log("[notice] started discord bot")

    client.guilds.cache.forEach(guild => {
        console.log(`Guild ID: ${guild.id} | Guild Name: ${guild.name}`);
    })
})

function logMsg(msg, status = null) {
    if (msg.content) {
        const username = msg.author.tag
        const guildName = msg.guild.name
        const guildId = msg.guild.id
        const channelName = msg.channel.name
        const channelId = msg.channel.id
        const date = msg.createdAt

        const prefix = status ? `[${status}] ` : ""

        log.logChatMessage(`${guildName}-${guildId}`, `${channelName}-${channelId}`, username, date, prefix + msg.content)
        .catch(err => {
            console.error(err)
        })
    }
}

client.on("messageCreate", async msg => {
    logMsg(msg)
})

client.on("messageUpdate", (oldMsg, newMsg) => {
    logMsg(newMsg, "edited")
})

client.on("messageDelete", msg => {
    logMsg(msg, "deleted")
})

client.on("messageDeleteBulk", msgs => {
    msgs.forEach((msg, id) => {
        logMsg(msg, "deleted")
    })
})

client.on("channelUpdate", (oldChannel, newChannel) => {
    const guildName = newChannel.guild.name
    const channelName = newChannel.name
    const date = new Date()
    if (oldChannel.topic != newChannel.topic) {
        const topic = newChannel.topic
        let line
        if (topic && topic.length > 0) {
            line = `-!- Channel topic changed to: ${topic}`
        } else {
            line = `-!- Channel topic removed`
        }
        log.logMessage(guildName, channelName, date, line)
    }
    if (oldChannel.nsfw != newChannel.nsfw) {
        let line
        if (newChannel.nsfw) {
            line = '-!- Channel enabled NSFW'
        } else {
            line = '-!- Channel disabled NSFW'
        }
        log.logMessage(guildName, channelName, date, line)
    }
})

client.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => {
    const user = client.users.cache.get(newVoiceState.id)
    if (newVoiceState.channelId == null && oldVoiceState.channelId != null) {
        // user left
        const channelId = oldVoiceState.channelId
        if (channelId) {
            const channel = client.channels.cache.get(channelId)
            const guild = channel.guild
            log.logMessage(`${guild.name}-${guild.id}`, `${channel.name}-${channel.id}`, new Date(), `* ${user.tag} left voice channel`)
        }
    } else if (newVoiceState.channelId != null && oldVoiceState.channelId == null) {
        // user joined
        const channelId = newVoiceState.channelId
        if (channelId) {
            const channel = client.channels.cache.get(channelId)
            const guild = channel.guild
            log.logMessage(`${guild.name}-${guild.id}`, `${channel.name}-${channel.id}`, new Date(), `* ${user.tag} joined voice channel`)
        }
    }
})

try {
    client.login(discordToken)
} catch (err) {
    console.log("[error] failed to start discord bot")
    console.log(err)
}

