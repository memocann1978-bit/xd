const test = require('node:test');
const assert = require('node:assert/strict');
const createDefaultSettings = require('../Global/Source/SettingsDefaults');

test('guild defaults include all declared setup fields', () => {
    const defaults = createDefaultSettings();
    const { Setup } = require('../Global/Settings/_settings');
    for (const setting of Setup) {
        assert.ok(Object.prototype.hasOwnProperty.call(defaults, setting.name), 'missing default: ' + setting.name);
    }
});

test('role and channel collections are initialized as arrays', () => {
    const defaults = createDefaultSettings();
    assert.deepEqual(defaults.kayıtsızRolleri, []);
    assert.deepEqual(defaults.erkekRolleri, []);
    assert.deepEqual(defaults.izinliKanallar, []);
    assert.equal(defaults.teyitZorunlu, true);
    assert.equal(defaults.kayıtsızLimit, 3);
});
