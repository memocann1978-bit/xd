const { Event } = require('../../../../Global/Client/Structures/Default.Event');
const { AuditLogEvent } = require('discord.js');
const Users = require('../../../../Global/Database/Schemas/Client.Users');
const Roles = require('../../../../Global/Database/Schemas/Guards/GuildMember.Roles.Backup');
const leftRoles = require('../../../../Global/Database/Schemas/Users.Left.Roles');
const GuildSettings = require('../../../../Global/Database/Schemas/Guild.Settings');
const { genEmbed } = require('../../../../Global/Source/Embed');

class GuildMemberRemove extends Event {
    constructor(client) {
        super(client, { name: 'guildMemberRemove', enabled: true });
    }

    async onLoad(member) {
        if (!member?.guild || member.guild.id !== global.sistem.Settings.guildID) return;
        const logChannel = member.guild.kanalBul('ayrılanlar');
        if (logChannel) {
            const timestamp = Math.floor(Date.now() / 1000);
            await logChannel.send({ content: String(member), embeds: [new genEmbed().setDescription(member + ' (`' + member.id + '`) üyesi <t:' + timestamp + ':R> ayrıldı.')] }).catch(() => null);
        }

        const roles = global.roller || {};
        const restricted = [roles.jailRolü, roles.şüpheliRolü, roles.underworldRolü, roles.yasaklıTagRolü, ...(roles.kayıtsızRolleri || [])].filter(Boolean);
        if (restricted.some(roleID => member.roles.cache.has(roleID))) return;
        if (typeof member.Left === 'function') await member.Left().catch(() => null);
    }
}

module.exports = GuildMemberRemove;

// Keep member-exit bookkeeping separate from the Event class handler.
client.on('guildMemberRemove', async member => {
    if (!member?.guild || member.guild.id !== global.sistem.Settings.guildID) return;
    try {
        await Roles.deleteOne({ _id: member.id });
        const user = await client.users.fetch(member.id).catch(() => null);
        if (user) {
            await GuildSettings.updateOne({ guildID: member.guild.id }, { $set: { 'Caches.latest': { id: user.id, avatarURL: user.displayAvatarURL({ size: 4096 }), tag: user.tag } } }, { upsert: true });
        }

        const roles = global.roller || {};
        const staffRole = roles.altilkyetki ? member.guild.roles.cache.get(roles.altilkyetki) : null;
        const highestRole = member.roles.highest;
        if (staffRole && highestRole && staffRole.position < highestRole.position) {
            const roleIDs = member.roles.cache.filter(role => role.id !== member.guild.id).map(role => role.id);
            await leftRoles.updateOne({ _id: member.id }, { $set: { _roles: roleIDs } }, { upsert: true });
        }

        const audit = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 }).catch(() => null);
        const entry = audit?.entries?.first();
        if (entry?.executor && entry.createdTimestamp > Date.now() - 5000) {
            await Users.updateOne({ _id: entry.executor.id }, { $inc: { 'Uses.Kick': 1 } }, { upsert: true });
        }
    } catch (error) {
        client._logger.log('Member leave bookkeeping failed: ' + error.message, 'warn');
    }
});
