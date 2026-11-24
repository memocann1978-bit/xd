const { Setup } = require('../Settings/_settings');

function createDefaultSettings() {
    const defaults = {
        kayıtsızLimit: 3,
        muteLimit: 3,
        voiceMuteLimit: 3,
        jailLimit: 3,
        banLimit: 3,
        minYaş: 18,
        teyitZorunlu: true,
        tag: '',
        tagsiz: '',
        staff: [],
        yasakTaglar: [],
        type: false
    };

    for (const setting of Setup) {
        if (Object.prototype.hasOwnProperty.call(defaults, setting.name)) continue;
        switch (setting.type) {
            case 'acmali': defaults[setting.name] = false; break;
            case 'roller':
            case 'kanallar':
            case 'cogul': defaults[setting.name] = []; break;
            case 'tekil': defaults[setting.name] = ''; break;
            case 'rol':
            case 'kanal': defaults[setting.name] = null; break;
            default: defaults[setting.name] = null;
        }
    }

    return defaults;
}

module.exports = createDefaultSettings;
