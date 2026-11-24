const { Event } = require('../../../../Global/Client/Structures/Default.Event');

class InteractionCreate extends Event {
    constructor(client) {
        super(client, { name: 'interactionCreate', enabled: true });
    }

    async onLoad(interaction) {
        const client = this.client;
        if (!interaction || !interaction.isChatInputCommand?.() && !interaction.isAutocomplete?.()) return;

        const command = client.slashcommands.get(interaction.commandName);
        if (!command) {
            if (interaction.isAutocomplete?.()) return interaction.respond([]).catch(() => null);
            if (interaction.isRepliable?.()) return interaction.reply({ content: 'Bu komut artık kullanılamıyor.', ephemeral: true }).catch(() => null);
            return;
        }

        try {
            if (interaction.isAutocomplete?.()) {
                if (typeof command.autocomplete === 'function') await command.autocomplete(interaction, []);
                else await interaction.respond([]).catch(() => null);
                return;
            }
            if (typeof command.onRequest !== 'function') {
                return interaction.reply({ content: 'Komut henüz yapılandırılmamış.', ephemeral: true }).catch(() => null);
            }
            await command.onRequest(client, interaction);
        } catch (error) {
            client._logger.log('Slash command ' + interaction.commandName + ' failed: ' + (error.stack || error.message), 'error');
            const payload = { content: 'Komut çalıştırılırken beklenmeyen bir hata oluştu.', ephemeral: true };
            if (interaction.deferred || interaction.replied) await interaction.followUp(payload).catch(() => null);
            else await interaction.reply(payload).catch(() => null);
        }
    }
}

module.exports = InteractionCreate;