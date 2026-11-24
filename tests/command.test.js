const test = require('node:test');
const assert = require('node:assert/strict');
const { Map } = global;
const { Command } = require('../Global/Client/Structures/Default.Command');

function createClient() {
    return { commands: new Map(), aliases: new Map(), _logger: { log() {} } };
}

test('command names and aliases are normalized', () => {
    const client = createClient();
    class Sample extends Command {
        constructor(instance) { super(instance, { name: '  HeLLo ', aliases: ['Hi', 'HEY'] }); }
        onRequest() {}
    }
    const command = new Sample(client);
    assert.equal(command.on(), true);
    assert.equal(client.commands.get('hello'), command);
    assert.equal(client.aliases.get('hi'), command);
    assert.equal(client.aliases.get('hey'), command);
});

test('disabled commands are not registered', () => {
    const client = createClient();
    class Disabled extends Command {
        constructor(instance) { super(instance, { name: 'disabled', enabled: false }); }
        onRequest() {}
    }
    assert.equal(new Disabled(client).on(), false);
    assert.equal(client.commands.has('disabled'), false);
});
