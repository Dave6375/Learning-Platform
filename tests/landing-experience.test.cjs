/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
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

let LandingExperience;
let textScramble;
let getHeroPatternAdapter;
try {
    textScramble = require(path.join(projectRoot, 'src', 'components', 'ui', 'text-scramble.ts'));
    ({ getHeroPatternAdapter } = require(path.join(
        projectRoot, 'src', 'components', 'plexus-webgl', 'hero-pattern-adapters.tsx',
    )));
    LandingExperience = require(path.join(
        projectRoot, 'src', 'components', 'home', 'LandingExperience.tsx',
    )).default;
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

function getScrambledInputs(lang) {
    const inputs = [];
    const originalUseTextScramble = textScramble.useTextScramble;
    textScramble.useTextScramble = (...args) => {
        inputs.push(args[0]);
        return originalUseTextScramble(...args);
    };

    try {
        renderToStaticMarkup(React.createElement(LandingExperience, { lang }));
    } finally {
        textScramble.useTextScramble = originalUseTextScramble;
    }

    return inputs;
}

function getLandingMarkup(lang) {
    return renderToStaticMarkup(React.createElement(LandingExperience, { lang }));
}

function expectedInputs(lang) {
    const entry = getHeroPatternAdapter('signature', lang).entries[0];
    return [entry.quote, entry.author ?? ''];
}

test('uses the English quote and author by default and for English', () => {
    assert.deepEqual(getScrambledInputs(), expectedInputs('en'));
    assert.deepEqual(getScrambledInputs('en'), expectedInputs('en'));
});

test('uses the Chinese quote and author for Chinese', () => {
    assert.deepEqual(getScrambledInputs('zh'), expectedInputs('zh'));
});

test('falls back to the English quote and author for Spanish', () => {
    assert.deepEqual(getScrambledInputs('es'), expectedInputs('en'));
});

test('new classic shapes generate finite points in both language rotations', () => {
    const names = ['Greek Amphora', 'Christ the Redeemer', 'DNA Double Helix'];
    for (const language of ['en', 'zh']) {
        const entries = getHeroPatternAdapter('codex', language).entries;
        for (const name of names) {
            const entry = entries.find((item) => item.name.en === name);
            assert.ok(entry, `${name} is missing for ${language}`);
            for (const count of [0, 1, 200, 800]) {
                const points = entry.shape.generate(count);
                assert.equal(points.length, count);
                assert.ok(points.every((point) =>
                    [point.x, point.y, point.z].every((value) => Number.isFinite(value) && Math.abs(value) <= 1),
                ));
            }
        }
    }
});

test('renders the localized landing intro and existing quote area', () => {
    assert.match(getLandingMarkup('en'), /Welcome to ANEX\. A place to learn, practice, and grow—one challenge at a time\./);
    assert.match(getLandingMarkup('en'), /The immortal gods have put sweat before virtue\./);
    assert.match(getLandingMarkup('en'), /Hesiod, Works and Days/);
    assert.match(getLandingMarkup('en'), /aria-label="ANEX Kronos"/);
    assert.match(getLandingMarkup('en'), /Get Started/);
    assert.match(getLandingMarkup('zh'), /自主学习平台，科技博客/);
    assert.match(getLandingMarkup('es'), /Plataforma de aprendizaje agente/);
    assert.match(getLandingMarkup('es'), /landing-hero-quote/);
});