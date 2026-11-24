const { Event } = require('../../../../Global/Client/Structures/Default.Event');
const GuardSettings = require('../../../../Global/Database/Schemas/Guards/Global.Guard.Settings');
const { OPTIONS, getSettings, buildPanel } = require('../../../../Global/Source/Guard.Panel');

class InteractionCreate extends Event {
    constructor(client) {
        super(client, { name: 'interactionCreate', enabled: true });
    }

    async onLoad(interaction) {
        const client = this.client;
        if (!interaction) return;
        if (interaction.isButton?.() && interaction.customId.startsWith('guardToggle:')) {
            const [, key, ownerID] = interaction.customId.split(':');
            const validKeys = new Set([...OPTIONS.map(([name]) => name), 'guildProtection', 'limit']);
            if (!validKeys.has(key) || !interaction.guild) return interaction.reply({ content: 'Geçersiz panel işlemi.', ephemeral: true }).catch(() => null);
            if (interaction.user.id !== ownerID) return interaction.reply({ content: 'Bu güvenlik panelini yalnızca açan kişi kullanabilir.', ephemeral: true }).catch(() => null);
            try {
                const current = await getSettings(interaction.guild.id);
                await GuardSettings.updateOne({ guildID: interaction.guild.id }, { $set: { [key]: !current[key] } });
                const updated = await getSettings(interaction.guild.id);
                return interaction.update(buildPanel(updated, ownerID));
            } catch (error) {
                client._logger.log('Guard panel update failed: ' + error.message, 'error');
                return interaction.reply({ content: 'Güvenlik ayarı kaydedilemedi.', ephemeral: true }).catch(() => null);
            }
        }
        if (!interaction.isChatInputCommand?.() && !interaction.isAutocomplete?.()) return;

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