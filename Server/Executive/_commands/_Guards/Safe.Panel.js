const { Command } = require('../../../../Global/Client/Structures/Default.Command');
const { getSettings, buildPanel } = require('../../../../Global/Source/Guard.Panel');

class SafePanel extends Command {
    constructor(client) {
        super(client, {
            name: 'safe',
            description: 'Sunucu güvenlik ayarlarını interaktif panelden yönetir.',
            usage: '.safe',
            category: 'Guard',
            aliases: ['safelist', 'gpanel', 'guard'],
            enabled: true,
            permissions: ['BOT_OWNER', 'GUILD_OWNER']
        });
    }

    async onRequest(client, message) {
        if (!message.guild) return;
        const settings = await getSettings(message.guild.id);
        return message.channel.send(buildPanel(settings, message.author.id));
    }
}

module.exports = SafePanel;
