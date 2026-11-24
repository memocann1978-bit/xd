const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { black } = require('chalk');
const { glob } = require('glob');
const { promisify } = require('util');
const globPromise = promisify(glob);

global.sistem = global.system = require('../Settings/_system.json');

class MODLOFF extends Client {
    constructor(options = {}) {
        super({
            ...options,
            intents: options.intents || [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildVoiceStates
            ],
            partials: options.partials || [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User]
        });

        this._logger = require('../Functions/Logger');
        require('../Functions/Dates');
        this.genEmbed = global.genEmbed = require('../Source/Embed');
        this.sistem = this.system = global.sistem;
        this.commands = new Collection();
        this.aliases = new Collection();
        this.slashcommands = new Collection();
        this._dirname = null;

        this.on('disconnect', () => this._logger.log('Bot is disconnecting...', 'disconnecting'));
        this.on('reconnecting', () => this._logger.log('Bot reconnecting...', 'reconnecting'));
        this.on('error', error => this._logger.log(error.stack || error.message, 'error'));
        this.on('warn', info => this._logger.log(info, 'warn'));

        process.on('warning', warning => this._logger.log(warning.stack || warning.message, 'warn'));
        require('../Functions/Numbers');
        require('../Prototypes/_function');
        require('../Prototypes/_user');
    }

    _getModuleDirectory(kind) {
        if (!this._dirname) throw new Error('Set client._dirname before loading modules.');
        return path.resolve(process.cwd(), kind);
    }

    async fetchCommands(active = true, slash = false) {
        if (!active && !slash) return;
        const commandRoot = this._getModuleDirectory('_commands');

        if (active && fs.existsSync(commandRoot)) {
            const categories = fs.readdirSync(commandRoot, { withFileTypes: true }).filter(entry => entry.isDirectory());
            for (const category of categories) {
                const categoryPath = path.join(commandRoot, category.name);
                const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
                for (const file of files) {
                    const CommandClass = require(path.join(categoryPath, file));
                    const command = new CommandClass(this);
                    if (command && typeof command.on === 'function') command.on();
                }
                this._logger.log(this._dirname + ': loaded ' + files.length + ' commands from ' + category.name + '.', 'load');
            }
        }

        if (slash) {
            const slashRoot = this._getModuleDirectory('_slashcommands');
            if (!fs.existsSync(slashRoot)) return;
            const files = await globPromise(path.join(slashRoot, '*', '*.js'));
            const definitions = [];
            for (const file of files) {
                const command = require(file);
                if (!command || !command.name) continue;
                this.slashcommands.set(command.name, command);
                definitions.push(command);
            }
            this.once('ready', async () => {
                if (!this.sistem.Settings.guildID) {
                    this._logger.log('Slash commands not registered: Settings.guildID is empty.', 'warn');
                    return;
                }
                const guild = await this.guilds.fetch(this.sistem.Settings.guildID);
                await guild.commands.set(definitions);
                this._logger.log('Registered ' + definitions.length + ' slash commands.', 'ready');
            });
        }
    }

    async fetchEvents(active = true) {
        if (!active) return;
        const eventRoot = this._getModuleDirectory('_events');
        if (!fs.existsSync(eventRoot)) return;
        const categories = fs.readdirSync(eventRoot, { withFileTypes: true }).filter(entry => entry.isDirectory());
        for (const category of categories) {
            const categoryPath = path.join(eventRoot, category.name);
            const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
            for (const file of files) {
                const EventClass = require(path.join(categoryPath, file));
                const event = new EventClass(this);
                if (event && typeof event.on === 'function') event.on();
            }
        }
    }

    async connect(token) {
        if (!token) throw new Error(this._dirname + ' bot token is missing. Set the matching environment variable or Settings.Login value.');
        try {
            await this.login(token);
            return this.user;
        } catch (error) {
            this._logger.log(this._dirname + ' login failed: ' + error.message, 'error');
            throw error;
        }
    }
}

module.exports = { MODLOFF };