const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const GuardSettings = require('../Database/Schemas/Guards/Global.Guard.Settings');

const OPTIONS = [
    ['roleGuard', 'Rol koruması'],
    ['channelGuard', 'Kanal koruması'],
    ['botGuard', 'Bot ekleme koruması'],
    ['everyoneGuard', '@everyone koruması'],
    ['webhookGuard', 'Webhook koruması'],
    ['guildGuard', 'Sunucu ayar koruması'],
    ['webGuard', 'URL koruması'],
    ['offlineGuard', 'Çevrimdışı koruma'],
    ['emojiGuard', 'Emoji koruması'],
    ['stickerGuard', 'Sticker koruması'],
    ['pruneGuard', 'Toplu çıkarma koruması'],
    ['memberRoleGuard', 'Üye rol koruması'],
    ['banGuard', 'Ban koruması'],
    ['muteGuard', 'Mute koruması'],
    ['kickGuard', 'Kick koruması'],
    ['disconnectGuard', 'Ses bağlantısı koruması'],
    ['nicknameGuard', 'Takma ad koruması']
];

async function getSettings(guildID) {
    return GuardSettings.findOneAndUpdate(
        { guildID },
        { $setOnInsert: { guildID } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
}

function buildPanel(settings, ownerID) {
    const enabled = OPTIONS.filter(([key]) => settings[key]).length;
    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Sunucu Güvenlik Paneli')
        .setDescription('Aşağıdaki butonlarla korumaları açıp kapatabilirsin. Değişiklikler anında veritabanına kaydedilir.')
        .addFields(
            { name: 'Genel koruma', value: settings.guildProtection ? '🟢 Açık' : '🔴 Kapalı', inline: true },
            { name: 'İşlem limiti', value: settings.limit ? '🟢 Açık' : '🔴 Kapalı', inline: true },
            { name: 'Aktif korumalar', value: enabled + '/' + OPTIONS.length, inline: true }
        )
        .setFooter({ text: 'Yalnızca paneli açan yetkili kullanabilir.' });

    const rows = [];
    for (let i = 0; i < OPTIONS.length; i += 5) {
        const row = new ActionRowBuilder();
        for (const [key, label] of OPTIONS.slice(i, i + 5)) {
            const active = Boolean(settings[key]);
            row.addComponents(new ButtonBuilder()
                .setCustomId('guardToggle:' + key + ':' + ownerID)
                .setLabel(label)
                .setStyle(active ? ButtonStyle.Success : ButtonStyle.Secondary));
        }
        rows.push(row);
    }

    const general = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('guardToggle:guildProtection:' + ownerID).setLabel('Genel koruma').setStyle(settings.guildProtection ? ButtonStyle.Success : ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('guardToggle:limit:' + ownerID).setLabel('İşlem limiti').setStyle(settings.limit ? ButtonStyle.Success : ButtonStyle.Secondary)
    );
    rows.push(general);
    return { embeds: [embed], components: rows };
}

module.exports = { OPTIONS, getSettings, buildPanel };
