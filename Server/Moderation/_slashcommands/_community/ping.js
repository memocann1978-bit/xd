const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Botun bağlantı ve API gecikmesini gösterir.',
    options: [],
    async onRequest(client, interaction) {
        await interaction.deferReply({ ephemeral: true });
        const latency = Date.now() - interaction.createdTimestamp;
        const api = Math.round(client.ws.ping);
        const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('Bağlantı Durumu')
            .addFields(
                { name: 'Bot yanıt süresi', value: latency + ' ms', inline: true },
                { name: 'Discord API', value: api + ' ms', inline: true },
                { name: 'Durum', value: 'Çevrimiçi', inline: true }
            )
            .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
    }
};
