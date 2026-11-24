const test = require('node:test');
const assert = require('node:assert/strict');
const { OPTIONS, buildPanel } = require('../Global/Source/Guard.Panel');

test('guard panel creates valid button rows for every protection setting', () => {
    const settings = Object.fromEntries(OPTIONS.map(([key]) => [key, false]));
    settings.guildProtection = true;
    settings.limit = true;
    const panel = buildPanel(settings, '123456789012345678');
    assert.equal(panel.embeds.length, 1);
    assert.equal(panel.components.length, 5);
    const count = panel.components.reduce((total, row) => total + row.components.length, 0);
    assert.equal(count, OPTIONS.length + 2);
    for (const row of panel.components) assert.ok(row.components.length <= 5);
});
