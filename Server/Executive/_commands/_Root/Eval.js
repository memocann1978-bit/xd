const { Command } = require('../../../../Global/Client/Structures/Default.Command');

class Eval extends Command {
    constructor(client) {
        super(client, {
            name: 'heval',
            description: 'Güvenlik nedeniyle devre dışı bırakılmış geliştirici komutu.',
            usage: 'Devre dışı',
            category: 'Root',
            aliases: ['hewal'],
            enabled: true,
            permissions: ['BOT_OWNER']
        });
    }

    async onRequest(client, message) {
        return message.reply({ content: 'Eval komutu güvenlik nedeniyle devre dışı bırakıldı.' }).catch(() => null);
    }
}

module.exports = Eval;