const fs = require("fs").promises
const path = require("path")

const logDirectory = path.join(__dirname, "logs")

function logDirectoryForServer(server) {
    return path.join(logDirectory, "server")
}

function isoTimestamp(date) {
    const isoTimestamp = date.toISOString()
    return  isoTimestamp.slice(0, -5) + "Z"
}

async function logMessage(server, channel, date, message) {
    const serverLogDirectory = logDirectoryForServer(server)
    const channelLogFile = path.join(serverLogDirectory, `${channel}.log`)
    
    try {
        await fs.mkdir(serverLogDirectory, { recursive: true })
    } catch (err) {
        console.error(err)
        throw new Error("Failed to create server log directory")
    }

    const timestamp = isoTimestamp(date)
    const line = `${timestamp} ${message}\n`

    try {
        await fs.appendFile(channelLogFile, line)
    } catch (err) {
        console.error(err)
        throw new Error(`Failed to append to channel log: ${channelLogFile}`)
    }
}
exports.logMessage = logMessage

async function logChatMessage(server, channel, username, date, message) {
    const formattedMessage = message.replace(/\n/g, "\\n").replace(/\t/g, "\\t")
    const line = `<${username}> ${message}`
    await logMessage(server, channel, date, line)
}
exports.logChatMessage = logChatMessage
