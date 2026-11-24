const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'sunucu',
    description: 'Sunucunun temel bilgilerini gösterir.',
    options: [],
    async onRequest(client, interaction) {
        const guild = interaction.guild;
        const owner = await guild.fetchOwner().catch(() => null);
        const channels = guild.channels.cache;
        const textChannels = channels.filter(channel => channel.isTextBased()).size;
        const voiceChannels = channels.filter(channel => channel.isVoiceBased()).size;
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL({ size: 512 }))
            .addFields(
                { name: 'Sunucu sahibi', value: owner ? owner.user.tag : 'Bilinmiyor', inline: true },
                { name: 'Üye sayısı', value: String(guild.memberCount), inline: true },
                { name: 'Roller', value: String(guild.roles.cache.size), inline: true },
                { name: 'Metin kanalları', value: String(textChannels), inline: true },
                { name: 'Ses kanalları', value: String(voiceChannels), inline: true },
                { name: 'Boost seviyesi', value: String(guild.premiumTier), inline: true },
                { name: 'Oluşturulma tarihi', value: '<t:' + Math.floor(guild.createdTimestamp / 1000) + ':F>', inline: false },
                { name: 'Sunucu kimliği', value: guild.id, inline: false }
            )
            .setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
