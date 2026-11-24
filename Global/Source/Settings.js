const Guilds = require('../Database/Schemas/Guild.Settings');

class GUILD {
    static async fetch(id) {
        if (!id) throw new Error('Settings.guildID is required before loading guild settings.');
        if (!global.client) throw new Error('Discord client must be initialized before loading guild settings.');

        try {
            await Guilds.updateOne({ guildID: id }, { $setOnInsert: { _id: 1, guildID: id } }, { upsert: true });
            const data = await Guilds.findOne({ guildID: id });
            if (!data) throw new Error('Guild settings document could not be loaded for ' + id + '.');

            const client = global.client;
            global.ayarlar = global._settings = client._settings = data.Ayarlar;
            global.kanallar = global.channels = client._channels = data.Ayarlar;
            global.roller = global._roles = client._roles = data.Ayarlar;
            global.emojiler = global._emojis = client._emojis = require('../Settings/_emojis.json');
            global.cevaplar = global._reply = client._reply = require('../Settings/_reply');
            return data;
        } catch (error) {
            global.client?._logger?.log('Guild settings load failed: ' + error.message, 'error');
            throw error;
        }
    }
}

module.exports = { GUILD };