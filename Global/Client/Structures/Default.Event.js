class Event {
    constructor(client, { name = null, enabled = true } = {}) {
        this.client = client;
        this.name = name;
        this.enabled = enabled;
        if (!this.name) throw new Error('Event name is required.');
    }
    on() {
        if (!this.enabled) return;
        if (typeof this.onLoad !== 'function') throw new TypeError('Event ' + this.name + ' must implement onLoad().');
        // Preserve the event instance as `this` inside every handler.
        this.client.on(this.name, (...args) => this.onLoad(...args));
    }
}
module.exports = { Event };