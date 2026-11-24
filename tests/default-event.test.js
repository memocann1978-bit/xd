const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { Event } = require('../Global/Client/Structures/Default.Event');

test('event handler runs with its event instance as this', async () => {
    const client = new EventEmitter();
    let called = false;
    class SampleEvent extends Event {
        constructor(instance) { super(instance, { name: 'sample' }); }
        onLoad(value) {
            assert.equal(this.client, client);
            assert.equal(value, 'payload');
            called = true;
        }
    }
    new SampleEvent(client).on();
    client.emit('sample', 'payload');
    assert.equal(called, true);
});

test('disabled events are not registered', () => {
    const client = new EventEmitter();
    class DisabledEvent extends Event {
        constructor(instance) { super(instance, { name: 'disabled', enabled: false }); }
        onLoad() { throw new Error('must not run'); }
    }
    new DisabledEvent(client).on();
    assert.equal(client.listenerCount('disabled'), 0);
});
