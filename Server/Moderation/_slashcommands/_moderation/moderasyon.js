const { ApplicationCommandOptionType, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    name: 'moderasyon',
    description: 'Sunucu moderasyon işlemlerini yönetir.',
    options: [
        { name: 'kick', description: 'Bir üyeyi sunucudan çıkarır.', type: ApplicationCommandOptionType.Subcommand, options: [
            { name: 'uye', description: 'Çıkarılacak üye.', type: ApplicationCommandOptionType.User, required: true },
            { name: 'sebep', description: 'İşlem sebebi.', type: ApplicationCommandOptionType.String, required: false }
        ] },
        { name: 'ban', description: 'Bir kullanıcıyı sunucudan yasaklar.', type: ApplicationCommandOptionType.Subcommand, options: [
            { name: 'kullanici', description: 'Yasaklanacak kullanıcı.', type: ApplicationCommandOptionType.User, required: true },
            { name: 'sebep', description: 'İşlem sebebi.', type: ApplicationCommandOptionType.String, required: false }
        ] },
        { name: 'timeout', description: 'Bir üyeye zaman aşımı uygular.', type: ApplicationCommandOptionType.Subcommand, options: [
            { name: 'uye', description: 'Zaman aşımı uygulanacak üye.', type: ApplicationCommandOptionType.User, required: true },
            { name: 'saniye', description: 'Süre (60-2419200 saniye).', type: ApplicationCommandOptionType.Integer, required: true, min_value: 60, max_value: 2419200 },
            { name: 'sebep', description: 'İşlem sebebi.', type: ApplicationCommandOptionType.String, required: false }
        ] },
        { name: 'timeout-kaldir', description: 'Üyenin zaman aşımını kaldırır.', type: ApplicationCommandOptionType.Subcommand, options: [
            { name: 'uye', description: 'Zaman aşımı kaldırılacak üye.', type: ApplicationCommandOptionType.User, required: true },
            { name: 'sebep', description: 'İşlem sebebi.', type: ApplicationCommandOptionType.String, required: false }
        ] },
        { name: 'temizle', description: 'Kanaldaki son mesajları topluca siler.', type: ApplicationCommandOptionType.Subcommand, options: [
            { name: 'adet', description: 'Silinecek mesaj sayısı (1-100).', type: ApplicationCommandOptionType.Integer, required: true, min_value: 1, max_value: 100 }
        ] }
    ],

    async onRequest(client, interaction) {
        const action = interaction.options.getSubcommand();
        const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi.';
        const permissions = {
            kick: PermissionFlagsBits.KickMembers,
            ban: PermissionFlagsBits.BanMembers,
            timeout: PermissionFlagsBits.ModerateMembers,
            'timeout-kaldir': PermissionFlagsBits.ModerateMembers,
            temizle: PermissionFlagsBits.ManageMessages
        };
        const required = permissions[action];
        if (!interaction.memberPermissions?.has(required)) return interaction.reply({ content: 'Bu işlem için gerekli Discord yetkin yok.', ephemeral: true });

        try {
            if (action === 'kick') {
                if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) return interaction.reply({ content: 'Botta Üyeleri At yetkisi bulunmuyor.', ephemeral: true });
                const target = await interaction.guild.members.fetch(interaction.options.getUser('uye').id);
                if (!target.kickable) return interaction.reply({ content: 'Bu üyeyi atamıyorum. Rol hiyerarşisini ve bot yetkilerini kontrol et.', ephemeral: true });
                await target.kick(reason);
                return interaction.reply({ content: target.user.tag + ' sunucudan çıkarıldı. Sebep: ' + reason, ephemeral: true });
            }

            if (action === 'ban') {
                if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) return interaction.reply({ content: 'Botta Üyeleri Yasakla yetkisi bulunmuyor.', ephemeral: true });
                const target = interaction.options.getUser('kullanici');
                await interaction.guild.members.ban(target.id, { reason });
                return interaction.reply({ content: target.tag + ' sunucudan yasaklandı. Sebep: ' + reason, ephemeral: true });
            }

            if (action === 'timeout' || action === 'timeout-kaldir') {
                if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: 'Botta Üyelere Zaman Aşımı Uygula yetkisi bulunmuyor.', ephemeral: true });
                const target = await interaction.guild.members.fetch(interaction.options.getUser('uye').id);
                if (!target.moderatable) return interaction.reply({ content: 'Bu üyeye işlem uygulayamıyorum. Rol hiyerarşisini kontrol et.', ephemeral: true });
                if (action === 'timeout') {
                    const seconds = interaction.options.getInteger('saniye');
                    await target.timeout(seconds * 1000, reason);
                    return interaction.reply({ content: target.user.tag + ' için ' + seconds + ' saniyelik zaman aşımı uygulandı.', ephemeral: true });
                }
                await target.timeout(null, reason);
                return interaction.reply({ content: target.user.tag + ' kullanıcısının zaman aşımı kaldırıldı.', ephemeral: true });
            }

            if (action === 'temizle') {
                if (![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(interaction.channel.type)) return interaction.reply({ content: 'Bu komut yalnızca metin kanallarında kullanılabilir.', ephemeral: true });
                if (!interaction.guild.members.me.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageMessages)) return interaction.reply({ content: 'Botun bu kanalda Mesajları Yönet yetkisi yok.', ephemeral: true });
                const amount = interaction.options.getInteger('adet');
                const deleted = await interaction.channel.bulkDelete(amount, true);
                return interaction.reply({ content: deleted.size + ' mesaj silindi. 14 günden eski mesajlar Discord tarafından toplu silinemez.', ephemeral: true });
            }
        } catch (error) {
            client._logger.log('Moderation action failed: ' + error.message, 'error');
            const response = { content: 'İşlem gerçekleştirilemedi. Üye rol hiyerarşisini ve bot izinlerini kontrol et.', ephemeral: true };
            if (interaction.deferred || interaction.replied) return interaction.followUp(response).catch(() => null);
            return interaction.reply(response).catch(() => null);
        }
    }
};
