/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');
const originalTsExtension = require.extensions['.ts'];
const originalTsxExtension = require.extensions['.tsx'];
const originalResolveFilename = Module._resolveFilename;

const compileTypeScript = (module, filename) => {
    const source = fs.readFileSync(filename, 'utf8');
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            jsx: ts.JsxEmit.ReactJSX,
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
            esModuleInterop: true,
        },
    });
    module._compile(compiled.outputText, filename);
};

require.extensions['.ts'] = compileTypeScript;
require.extensions['.tsx'] = compileTypeScript;
Module._resolveFilename = function (request, parent, isMain, options) {
    const resolvedRequest = request.startsWith('@/')
        ? path.join(projectRoot, 'src', request.slice(2))
        : request;
    return originalResolveFilename.call(this, resolvedRequest, parent, isMain, options);
};

let getHeroPatternAdapter;
try {
    ({ getHeroPatternAdapter } = require(path.join(
        projectRoot,
        'src',
        'components',
        'plexus-webgl',
        'hero-pattern-adapters.tsx',
    )));
} finally {
    Module._resolveFilename = originalResolveFilename;
    if (originalTsExtension) {
        require.extensions['.ts'] = originalTsExtension;
    } else {
        delete require.extensions['.ts'];
    }
    if (originalTsxExtension) {
        require.extensions['.tsx'] = originalTsxExtension;
    } else {
        delete require.extensions['.tsx'];
    }
}

const readSource = (...segments) => fs.readFileSync(path.join(projectRoot, ...segments), 'utf8');

test('selects the localized catalog entries without changing the English default', () => {
    const english = getHeroPatternAdapter('signature');
    const chinese = getHeroPatternAdapter('signature', 'zh');

    assert.equal(english.entries[0].name.en, 'Signature · Chronos');
    assert.equal(chinese.entries[0].name.en, 'Signature · ANEX');
    assert.notEqual(chinese, english);
});

test('renders the Plexus scene with its particle, connection, and glow layers', () => {
    const scene = readSource('src', 'components', 'plexus-webgl', 'PlexusScene.tsx');

    assert.match(scene, /export function PlexusScene/);
    assert.match(scene, /<Canvas/);
    assert.match(scene, /<ParticleField/);
    assert.match(scene, /<ConnectionLines/);
    assert.match(scene, /<PostProcessing/);
    assert.match(scene, /usePlexusTheme/);
});

test('loads the named scene only in the browser and exposes the public UI export', () => {
    const background = readSource('src', 'components', 'plexus-webgl', 'plexus-background.tsx');
    const publicBackground = readSource('src', 'components', 'ui', 'plexus-background.tsx');

    assert.match(background, /'use client'/);
    assert.match(background, /dynamic(?:<[^>]+>)?\(/);
    assert.match(background, /ssr:\s*false/);
    assert.match(background, /PlexusScene/);
    assert.match(publicBackground, /export \{ PlexusBackground }/);
});

test('keeps the WebGL layer from intercepting page input and cleans up browser listeners', () => {
    const scene = readSource('src', 'components', 'plexus-webgl', 'PlexusScene.tsx');

    assert.match(scene, /pointerEvents:\s*['"]none['"]/);
    assert.match(scene, /matchMedia/);
    assert.match(scene, /removeEventListener/);
});

test('creates and disposes the post processing composer outside render', () => {
    const postProcessing = readSource('src', 'components', 'plexus-webgl', 'PostProcessing.tsx');

    assert.doesNotMatch(postProcessing, /bloomPassRef\.current\s*=/);
    assert.match(postProcessing, /composer\.dispose\(\)/);
});
