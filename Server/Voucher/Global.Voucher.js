const { MODLOFF } = require('../../Global/Client/Global.Client');
const { Mongoose } = require('../../Global/Database/Global.MongoDriver');
const { GUILD } = require('../../Global/Source/Settings');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
process.chdir(__dirname);

async function start() {
    const client = global.client = new MODLOFF();
    client._dirname = 'Voucher';
    const settings = client.sistem.Settings;
    const database = settings.Database || {};
    const mongoUrl = process.env.MONGODB_URI || database.MongoURL;
    const token = process.env.VOUCHER_BOT_TOKEN || client.sistem.Login.Voucher;

    if (database.Active) {
        await Mongoose.Connect(true, mongoUrl, client);
        if (settings.guildID) await GUILD.fetch(settings.guildID);
    } else {
        client._logger.log('Database disabled. Invite tracking may not work.', 'warn');
    }

    await client.fetchCommands(false, false);
    await client.fetchEvents(true);
    await client.connect(token);
}

start().catch(error => {
    console.error('[Voucher startup failed]', error);
    process.exitCode = 1;
});