require("http").createServer((_, res) => res.end("Uptime")).listen(8080)

const { 
    default: makeWASocket, 
    downloadContentFromMessage, 
    DisconnectReason, 
    useSingleFileAuthState 
} = require ('@adiwajshing/baileys')

//=============NODE-MODULE=============\\
const fs = require('fs')
const pino = require('pino')

//===========Function==============\\
const { 
    isUrl, 
    sleep, 
    getGroupAdmins 
} = require('./Lib/function')
const {
    state, 
    saveState 
} = useSingleFileAuthState('Connection.json')

//===========Database==============\\
const setting = JSON.parse(fs.readFileSync('./Database/settings.json'));

prefix = setting.prefix
public = setting.public
noOwner = setting.noOwner
bot = setting.bot

//===================≠≠===================\\
async function StartBot() {

    const client = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ['Self Bot by Panggigo2712','Safari','3.0'],
        auth: state
    })

//===================≠≠===================\\
    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log("Connection ended.")

            if(shouldReconnect) {
                StartBot()
            }

        } else if(connection === "open") {
            console.log('Connected!')
        }
    })

//==========(CHAT-UPDATE)===========\\
    client.ev.on('messages.upsert', async ({ messages }) => {
        const info = messages[0]
        if (!info.message) return 
        const baileys = require('@adiwajshing/baileys');
        var type = baileys.getContentType(info.message);
        if (info.key && info.key.remoteJid == 'status@broadcast') return
        const fromMe = info.key.fromMe
        const itsMe = info.key.fromMe ? true : false
        const content = JSON.stringify(info.message)
        const quoted = info.quoted ? info.quoted : info
        const mime = (quoted.msg || quoted).mimetype || ''
        const isMedia = /image|video|sticker|audio/.test(mime)
        const from = info.key.remoteJid

//==============(BODY)================\\
        var body = (type === 'conversation') ? info.message.conversation : (type == 'imageMessage') ? info.message.imageMessage.caption : (type == 'videoMessage') ? info.message.videoMessage.caption : (type == 'extendedTextMessage') ? info.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? info.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? info.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? info.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (info.message.buttonsResponseMessage?.selectedButtonId || info.message.listResponseMessage?.singleSelectReply.selectedRowId || info.text) : ''

        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const command = isCmd ? body.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : null

//===============(BUDY)==================\\

        var budy = (type === 'conversation') ? info.message.conversation : (type === 'extendedTextMessage') ? info.message.extendedTextMessage.text : ''
        bidy =  budy.toLowerCase()

/********** IMAGE BUTTON **********/
        const ImgBut = async (id, img1, text1, desc1, but = [], vr) => {
            buttonMessage = {
                image: {url: img1},
                caption: text1,
                footer: desc1,
                buttons: but,
                headerType: 4
            }
            client.sendMessage(id, buttonMessage, {quoted: vr})
        }

/********** TEXT BUTTON **********/
        const TextBut = async (id, text1, desc1, but = [], vr) => {
            buttonMessage = {
                text: text1,
                footer: desc1,
                buttons: but,
                headerType: 4
            }
            client.sendMessage(id, buttonMessage, {quoted: vr})
        }

//======================================\\
        const q = args.join(' ')
        const reply = (text) => {client.sendMessage(from, {text: text}, { quoted: info})}

//======================================\\
        const isGroup = from.endsWith("@g.us")
        const groupMetadata = isGroup ? await client.groupMetadata(from): ""
        const groupName = isGroup ? groupMetadata.subject: ""
        const sender = isGroup ? info.key.participant: info.key.remoteJid
        const pushname = info.pushName ? info.pushName: `${bot}`
        const groupMembers = isGroup ? groupMetadata.participants : ''
        const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
        const isCreator = [client.user.id].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(sender)
        const isGroupAdmins = isGroup ? groupAdmins.includes(sender) : ''
        const groupDesc = isGroup ? groupMetadata.desc : ''
        const Owner = `${noOwner}@s.whatsapp.net`
        const isOwner = Owner.includes(sender)
        //media detect \\
		const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
		const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
		const isQuotedAudio = type === 'extendedTextMessage' && content.includes('audioMessage')
		const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')

        //Log Console
        if(isCmd && !isGroup) console.log(`Command Private\nCommand: ${command}\nName: ${pushname}`)
        if(!isCmd && !isGroup) console.log(`Message Private\nMessage: ${budy}\nName: ${pushname}`)
        if(isCmd && isGroup)console.log(`Group Command\nCommand: ${command}\nGroup: ${groupName}\nName: ${pushname}`)
        if(!isCmd && isGroup) console.log(`Group Message\nGroup: ${groupName}\nName: ${pushname}\nMessage: ${budy}`)

        if (!client.public) {
            if (!info.key.fromMe && !isCreator) return
        }
        try {
            switch(command) {
                case 'setprefix':
				if (!itsMe) return reply('')
				if (!args) return reply(`use ${prefix}setprefix prefix`)
				prefix = args
				setting.prefix = prefix
				fs.writeFileSync('./Database/settings.json', JSON.stringify(setting, null, '\t'))
                reply(`Prefix successfully changed to ${prefix}`)
                break

                case 'menu':
                ImgBut(from, `./Media/Foto/menu.jpeg`, `┏━━••• *_MENU_* 
┃》${prefix}menu
┗━━━━━━━━ ✓`, `★彡[Self-BOT]彡★`,
                [
                    {
                        buttonId: `${prefix}update`, 
                        buttonText: {
                            displayText: `UPDATE`
                        }, 
                        type: 1
                    },
                    {
                        buttonId: `${prefix}source`, 
                        buttonText: {
                            displayText: `SOURCE`
                        }, 
                        type: 1
                    }
                ], info)
                break

                case 'update':
                text = `Comingsoon`
                reply(text)
                break

                case 'source':
                text = `https://github.com/Panggigo/Selfbot`
                reply(text)
                break

                /*case 'text':
                client.sendMessage(from,{text: 'your text'})
                break

                case 'image':
                client.sendMessage(from,{image: fs.readFileSync('./Media/Foto/menu.jpeg')})
                break

                case 'video':
                client.sendMessage(from,{video: fs.readFileSync('./Media/Video/video.mp4')})
                break

                case 'gif':
                client.sendMessage(from,{video: fs.readFileSync('./Media/Video/video.mp4'),gifPlayback: true})
                break

                case 'audio':
                client.sendMessage(from,{audio: fs.readFileSync('./Media/Audio/audio.mp3')})
                break*/
            }
        } catch(error) {
            console.log(error)
        }
    })
}
StartBot()