const { Collection, PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');
const { Event } = require('../../../../Global/Client/Structures/Default.Event');
const cooldowns = new Collection();
const ms = require('ms');

class MessageCreate extends Event {
    constructor(client) {
        super(client, { name: 'messageCreate', enabled: true });
    }

    async onLoad(message) {
        const client = this.client;
        if (!message || !message.guild || !message.author || message.author.bot) return;
        if (message.channel?.type !== ChannelType.GuildText && message.channel?.type !== ChannelType.GuildAnnouncement && message.channel?.type !== ChannelType.PublicThread && message.channel?.type !== ChannelType.PrivateThread) return;

        const prefixes = Array.isArray(client.sistem.Settings.prefix) ? client.sistem.Settings.prefix : ['.'];
        const prefix = prefixes.filter(value => typeof value === 'string' && value.length > 0).sort((a, b) => b.length - a.length).find(value => message.content.startsWith(value));
        if (!prefix) return;

        const input = message.content.slice(prefix.length).trim();
        if (!input) return;
        const parts = input.split(/\s+/);
        const commandName = parts.shift().toLocaleLowerCase('tr-TR');
        const args = parts;
        const command = client.commands.get(commandName) || client.aliases.get(commandName);

        if (['tag'].includes(commandName)) {
            const tag = global.ayarlar?.tag;
            if (tag) return message.reply({ content: String(tag) }).catch(() => null);
        }

        if (commandName === 'link') {
            if (message.guild.vanityURLCode) return message.channel.send('https://discord.gg/' + message.guild.vanityURLCode).catch(() => null);
            try {
                const invite = await message.channel.createInvite({ maxAge: 0, maxUses: 0 });
                return message.channel.send('https://discord.gg/' + invite.code);
            } catch (error) {
                client._logger.log('Invite creation failed: ' + error.message, 'warn');
                return;
            }
        }

        const member = message.member;
        const restrictedRoles = [global.roller?.jailRolü, global.roller?.şüpheliRolü, global.roller?.underworldRolü, global.roller?.yasaklıTagRolü, ...(global.roller?.kayıtsızRolleri || [])].filter(Boolean);
        if (restrictedRoles.some(roleId => member.roles.cache.has(roleId))) return;
        if (!command || typeof command.onRequest !== 'function') return;

        const isGuildOwner = message.guild.ownerId === message.author.id;
        const isBotOwner = (client.sistem.Settings.root || []).includes(message.author.id);
        const required = Array.isArray(command.permissions) ? command.permissions : [];
        const hasPermission = required.length === 0 || required.some(permission => {
            if (permission === 'GUILD_OWNER') return isGuildOwner;
            if (permission === 'BOT_OWNER') return isBotOwner;
            return member.permissions.has(permission) || member.roles.cache.has(permission) || message.author.id === permission;
        });
        if (!hasPermission) {
            const denial = new EmbedBuilder().setColor(0xED4245).setDescription('Bu komutu kullanmak için gerekli yetkiye sahip değilsin.');
            return message.reply({ embeds: [denial] }).then(reply => setTimeout(() => reply.delete().catch(() => null), 5000)).catch(() => null);
        }

        const duration = typeof command.cooldown === 'number' ? command.cooldown : ms(command.cooldown || 0);
        const cooldownKey = command.name + ':' + message.author.id;
        const expiresAt = cooldowns.get(cooldownKey);
        if (expiresAt && expiresAt > Date.now()) {
            const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
            return message.reply({ content: 'Bu komutu tekrar kullanmak için ' + remaining + ' saniye beklemelisin.' }).catch(() => null);
        }

        try {
            await command.onRequest(client, message, args);
        } catch (error) {
            client._logger.log('Command ' + command.name + ' failed: ' + (error.stack || error.message), 'error');
            await message.reply({ content: 'Komut çalıştırılırken beklenmeyen bir hata oluştu.' }).catch(() => null);
        }

        if (duration > 0 && !isGuildOwner && !isBotOwner && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            cooldowns.set(cooldownKey, Date.now() + duration);
            setTimeout(() => cooldowns.delete(cooldownKey), duration).unref?.();
        }
    }
}

module.exports = MessageCreate;