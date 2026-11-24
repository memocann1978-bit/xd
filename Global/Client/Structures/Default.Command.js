class Command {
    constructor(client, {
        name = null,
        description = 'Açıklama belirtilmemiş.',
        usage = 'Kullanım belirtilmemiş.',
        category = 'Other',
        aliases = [],
        permissions = [],
        enabled = true,
        cooldown = 0
    } = {}) {
        if (!client) throw new TypeError('A Discord client is required to create a command.');
        this.client = client;
        this.name = typeof name === 'string' ? name.trim().toLowerCase() : name;
        this.description = description;
        this.usage = usage;
        this.aliases = Array.isArray(aliases) ? aliases : [];
        this.category = category;
        this.enabled = Boolean(enabled);
        this.permissions = Array.isArray(permissions) ? permissions : [];
        this.cooldown = cooldown;

        if (!this.name) throw new Error('Command name is required.');
        if (typeof this.onRequest === 'function') this.onRequest = this.onRequest.bind(this);
        if (typeof this.onLoad === 'function') this.onLoad(this.client);
    }

    on() {
        if (!this.enabled) return false;
        if (this.client.commands.has(this.name)) {
            this.client._logger?.log('Duplicate command skipped: ' + this.name, 'warn');
            return false;
        }
        this.client.commands.set(this.name, this);
        for (const alias of this.aliases) {
            const normalized = String(alias).trim().toLowerCase();
            if (!normalized || this.client.aliases.has(normalized) || this.client.commands.has(normalized)) {
                this.client._logger?.log('Duplicate or empty alias skipped for ' + this.name + ': ' + normalized, 'warn');
                continue;
            }
            this.client.aliases.set(normalized, this);
        }
        return true;
    }
}

module.exports = { Command };
