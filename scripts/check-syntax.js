const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ignored = new Set(['node_modules', '.git']);
const roots = ['Global', 'Server', 'scripts'];
const files = [];

function walk(directory) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!ignored.has(entry.name)) walk(path.join(directory, entry.name));
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(path.join(directory, entry.name));
        }
    }
}

for (const root of roots) walk(path.resolve(process.cwd(), root));
let failed = false;
for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) {
        failed = true;
        process.stderr.write('\nSyntax error in ' + path.relative(process.cwd(), file) + '\n' + (result.stderr || result.stdout));
    }
}
if (failed) process.exit(1);
console.log('Syntax check passed for ' + files.length + ' JavaScript files.');
