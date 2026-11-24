const { Event } = require('../../../../Global/Client/Structures/Default.Event');
const { ActivityType, ChannelType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const chalk = require('chalk');

class Ready extends Event {
    constructor(client) {
        super(client, { name: 'ready', enabled: true });
    }

    onLoad() {
        const client = this.client;
        const settings = client.sistem.Settings;
        const guildID = settings.guildID;

        const activityTexts = Array.isArray(settings.bio) ? settings.bio.filter(Boolean) : [];
        let activityIndex = 0;
        if (activityTexts.length) {
            const updateActivity = () => {
                if (!client.user) return;
                client.user.setActivity({ name: activityTexts[activityIndex++ % activityTexts.length], type: ActivityType.Playing });
            };
            updateActivity();
            setInterval(updateActivity, 30000).unref?.();
        }

        const voiceChannelID = settings.voice || settings.botSesKanalı;
        const ensureVoiceConnection = async () => {
            if (!voiceChannelID) return;
            try {
                const channel = await client.channels.fetch(voiceChannelID);
                if (!channel || ![ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(channel.type)) return;
                if (getVoiceConnection(channel.guild.id)) return;
                joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                    selfDeaf: true
                });
            } catch (error) {
                client._logger.log('Voice connection could not be established: ' + error.message, 'warn');
            }
        };
        ensureVoiceConnection();
        setInterval(ensureVoiceConnection, 30000).unref?.();

        client._logger.log('Successfully connected as ' + client.user.tag + (guildID ? ' for guild ' + guildID : '') + '.', 'ready');
    }
}

module.exports = Ready;
