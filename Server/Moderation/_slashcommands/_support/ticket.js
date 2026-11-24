const {
    ApplicationCommandOptionType,
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder
} = require('discord.js');
const Ticket = require('../../../../Global/Database/Schemas/Support.Tickets');

module.exports = {
    name: 'ticket',
    description: 'Destek talebi oluşturur veya mevcut talebi kapatır.',
    options: [
        {
            name: 'oluştur',
            description: 'Kişisel destek kanalı oluşturur.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                { name: 'kategori', description: 'Ticket kanalının açılacağı kategori.', type: ApplicationCommandOptionType.Channel, channel_types: [ChannelType.GuildCategory], required: false },
                { name: 'destek_rolu', description: 'Ticket kanalına erişecek destek rolü.', type: ApplicationCommandOptionType.Role, required: false }
            ]
        },
        {
            name: 'kapat',
            description: 'Bulunduğun ticket kanalını kapatır.',
            type: ApplicationCommandOptionType.Subcommand
        }
    ],

    async onRequest(client, interaction) {
        const action = interaction.options.getSubcommand();
        if (action === 'oluştur') {
            const existing = await Ticket.findOne({ guildID: interaction.guildId, creatorID: interaction.user.id, status: 'open' });
            if (existing) {
                const existingChannel = await interaction.guild.channels.fetch(existing.channelID).catch(() => null);
                if (existingChannel) return interaction.reply({ content: 'Zaten açık bir destek talebin var: ' + existingChannel, ephemeral: true });
                await Ticket.updateOne({ _id: existing._id }, { $set: { status: 'closed', closedAt: new Date(), closedBy: client.user.id } });
            }

            const category = interaction.options.getChannel('kategori');
            const supportRole = interaction.options.getRole('destek_rolu');
            const safeName = interaction.user.username.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 18) || 'uye';
            const overwrites = [
                { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
                { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] }
            ];
            if (supportRole) overwrites.push({ id: supportRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });

            let channel;
            try {
                channel = await interaction.guild.channels.create({
                    name: 'ticket-' + safeName,
                    type: ChannelType.GuildText,
                    parent: category?.id || null,
                    topic: 'Ticket owner: ' + interaction.user.id,
                    permissionOverwrites: overwrites
                });
                await Ticket.create({ guildID: interaction.guildId, channelID: channel.id, creatorID: interaction.user.id });
            } catch (error) {
                if (channel) await channel.delete('Ticket database kaydı oluşturulamadı').catch(() => null);
                client._logger.log('Ticket creation failed: ' + error.message, 'error');
                return interaction.reply({ content: 'Ticket oluşturulamadı. Botun kanal oluşturma ve MongoDB izinlerini kontrol edin.', ephemeral: true }).catch(() => null);
            }

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('Destek Talebin Açıldı')
                .setDescription('Merhaba ' + interaction.user + '! Sorununu ayrıntılı şekilde yaz. Destek ekibi en kısa sürede yardımcı olacaktır.')
                .addFields({ name: 'Talep sahibi', value: interaction.user.tag, inline: true }, { name: 'Talep numarası', value: channel.id, inline: true })
                .setTimestamp();
            await channel.send({ content: (supportRole ? supportRole.toString() + ' ' : '') + interaction.user.toString(), embeds: [embed] });
            return interaction.reply({ content: 'Destek talebin oluşturuldu: ' + channel, ephemeral: true });
        }

        if (action === 'kapat') {
            const ticket = await Ticket.findOne({ guildID: interaction.guildId, channelID: interaction.channelId, status: 'open' });
            if (!ticket) return interaction.reply({ content: 'Bu kanal açık bir ticket olarak kayıtlı değil.', ephemeral: true });
            const canClose = ticket.creatorID === interaction.user.id || interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels) || interaction.guild.ownerId === interaction.user.id;
            if (!canClose) return interaction.reply({ content: 'Bu ticketı yalnızca sahibi veya kanal yönetme yetkisi olan biri kapatabilir.', ephemeral: true });

            await interaction.deferReply({ ephemeral: true });
            try {
                await interaction.channel.permissionOverwrites.edit(ticket.creatorID, { SendMessages: false, AddReactions: false });
                if (!interaction.channel.name.startsWith('closed-')) await interaction.channel.setName('closed-' + interaction.channel.name.slice(0, 85));
                await Ticket.updateOne({ _id: ticket._id }, { $set: { status: 'closed', closedAt: new Date(), closedBy: interaction.user.id } });
                return interaction.editReply('Ticket kapatıldı. Kanal geçmişi silinmedi; sunucu yöneticileri gerektiğinde inceleyebilir.');
            } catch (error) {
                client._logger.log('Ticket close failed: ' + error.message, 'error');
                return interaction.editReply('Ticket kapatılırken bir hata oluştu. Botun kanal izinlerini kontrol edin.');
            }
        }
    }
};
