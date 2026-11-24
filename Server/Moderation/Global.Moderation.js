const { MODLOFF } = require('../../Global/Client/Global.Client');
const { Mongoose } = require('../../Global/Database/Global.MongoDriver');
const { GUILD } = require('../../Global/Source/Settings');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
process.chdir(__dirname);

let client;

async function shutdown(signal) {
    console.log('[' + signal + '] Shutting down Moderation service...');
    if (client) client.destroy();
    await Mongoose.Disconnect().catch(error => console.error('MongoDB shutdown error:', error.message));
    process.exit(0);
}

async function start() {
    client = global.client = new MODLOFF();
    client._dirname = 'Moderation';
    const settings = client.sistem.Settings;
    const database = settings.Database || {};
    const mongoUrl = process.env.MONGODB_URI || database.MongoURL;
    const token = process.env.MODERATION_BOT_TOKEN || client.sistem.Login.Moderation;

    if (database.Active) {
        await Mongoose.Connect(true, mongoUrl, client);
        if (settings.guildID) await GUILD.fetch(settings.guildID);
    } else {
        client._logger.log('Database disabled. Database-backed commands may not work.', 'warn');
    }

    await client.fetchCommands(true, true);
    await client.fetchEvents(true);
    await client.connect(token);
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

start().catch(async error => {
    console.error('[Moderation startup failed]', error);
    if (client) client.destroy();
    await Mongoose.Disconnect().catch(() => null);
    process.exitCode = 1;
});