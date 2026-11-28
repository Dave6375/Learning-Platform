const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const projectRoot = path.resolve(__dirname, '..');
const stylesheet = fs.readFileSync(path.join(projectRoot, 'src', 'app', 'globals.css'), 'utf8');

const rootVariables = stylesheet.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

test('defines defaults for overridable animation variables', () => {
    for (const [name, value] of Object.entries({
        '--duration': '40s',
        '--gap': '2rem',
        '--speed': '2s',
        '--landing-char-delay': '0s',
        '--background-y': '0%',
    })) {
        assert.match(rootVariables, new RegExp(`^\\s*${name}:\\s*${value};$`, 'm'));
        assert.match(stylesheet, new RegExp(`var\\(${name},\\s*${value}\\)`));
    }
});

test('references existing public font files relative to the stylesheet', () => {
    const fontUrls = [...stylesheet.matchAll(/url\(["']?([^\)"']*fonts\/[^\)"']+)["']?\)/g)]
        .map(([, url]) => url);

    assert.ok(fontUrls.length > 0);
    for (const url of fontUrls) {
        assert.ok(url.startsWith('../../public/fonts/'), `${url} should use the stylesheet relative path`);
        const publicFile = path.resolve(projectRoot, 'src', 'app', url);
        assert.ok(fs.existsSync(publicFile), `${url} should exist under public/`);
    }

    assert.doesNotMatch(stylesheet, /font-family:\s*var\(--[^,)]*\);/);
});
