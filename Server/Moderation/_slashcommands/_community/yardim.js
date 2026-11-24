const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'yardim',
    description: 'Botun kullanılabilir slash komutlarını listeler.',
    options: [{ name: 'komut', description: 'Detayını görmek istediğin komut.', type: ApplicationCommandOptionType.String, required: false }],
    async onRequest(client, interaction) {
        const requested = interaction.options.getString('komut');
        const commands = [...client.slashcommands.values()].filter(command => command.name !== 'yardim');
        if (requested) {
            const command = client.slashcommands.get(requested.toLowerCase());
            if (!command) return interaction.reply({ content: 'Bu isimde bir slash komutu bulunamadı.', ephemeral: true });
            const embed = new EmbedBuilder().setColor(0x5865F2).setTitle('/' + command.name).setDescription(command.description || 'Açıklama eklenmemiş.');
            if (Array.isArray(command.options) && command.options.length) embed.addFields({ name: 'Alt seçenekler', value: command.options.map(option => '`' + option.name + '` — ' + option.description).join('\n').slice(0, 1024) });
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        const description = commands.map(command => '`/' + command.name + '` — ' + (command.description || 'Açıklama yok')).join('\n');
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Komut Yardımı')
            .setDescription(description.slice(0, 4000) || 'Henüz komut bulunmuyor.')
            .setFooter({ text: commands.length + ' komut listelendi. Detay için /yardim komut:<isim> kullan.' });
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
