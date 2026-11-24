const mongoose = require('mongoose');
const createDefaultSettings = require('../../Source/SettingsDefaults');

const guilds = mongoose.model('Guild', new mongoose.Schema({
    _id: String,
    guildID: String,
    Date: { type: Date, default: Date.now },
    Caches: { type: Object, default: () => ({
        leaderboardVoice: undefined,
        leaderboardText: undefined,
        latest: undefined,
        lastRecord: undefined,
        lastTagged: undefined,
        lastStaff: undefined
    }) },
    Ayarlar: { type: Object, default: createDefaultSettings }
}));

module.exports = guilds;
