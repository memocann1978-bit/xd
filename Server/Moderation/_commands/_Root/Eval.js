const { Command } = require("../../../../Global/Client/Structures/Default.Command");

class Eval extends Command {
    constructor(client) {
        super(client, {
            name: "eval",
            description: "Botda komut denememizi sağlayan komutudur.",
            usage: "Bot için komut denememizi sağlayan komutdur.",
            category: "Root",
            aliases: [],
            enabled: true,
            permissions: ["BOT_OWNER","GUILD_OWNER"],
        });
    }
    
    /**
    * @param {client} client
    * @returns {Promise<Client>}
    */

    onLoad(client) {
    
    }

    async onRequest(client, message) {
        if (process.env.ENABLE_UNSAFE_EVAL !== 'true') {
            return message.reply({ content: 'Eval komutu güvenlik nedeniyle devre dışı. Yalnızca güvenilir geliştirme ortamında ENABLE_UNSAFE_EVAL=true ile açılabilir.' });
        }
        if (!client.sistem.Settings.root?.includes(message.author.id)) {
            return message.reply({ content: 'Bu komutu yalnızca bot geliştiricisi kullanabilir.' });
        }
        return message.reply({ content: 'Eval yeniden tasarlanıyor; geçici olarak kullanılamıyor.' });
    }
    }
}

function clean(text) {
    if (typeof text !== "string")
      text = require("util").inspect(text, { depth: 0 });
    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
    return text;
  }

module.exports = Eval
