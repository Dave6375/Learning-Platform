/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');
const originalResolveFilename = Module._resolveFilename;
const originalTypeScriptExtension = require.extensions['.ts'];

require.extensions['.ts'] = (module, filename) => {
    const source = fs.readFileSync(filename, 'utf8');
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
            esModuleInterop: true,
        },
    });
    module._compile(compiled.outputText, filename);
};

Module._resolveFilename = function (request, parent, isMain, options) {
    const resolvedRequest = request.startsWith('@/')
        ? path.join(projectRoot, 'src', request.slice(2))
        : request;
    return originalResolveFilename.call(this, resolvedRequest, parent, isMain, options);
};

let trilingual;
try {
    trilingual = require(path.join(projectRoot, 'src', 'lib', 'trilingual.ts'));
} finally {
    Module._resolveFilename = originalResolveFilename;
    if (originalTypeScriptExtension) {
        require.extensions['.ts'] = originalTypeScriptExtension;
    } else {
        delete require.extensions['.ts'];
    }
}

test('returns a translation from each supported language', () => {
    assert.equal(trilingual.useTranslation('en')('navigationHome'), 'Home');
    assert.equal(trilingual.useTranslation('zh')('navigationHome'), '首页');
    assert.equal(trilingual.useTranslation('es')('navigationHome'), 'Inicio');
});

test('translates the landing intro in each supported language', () => {
    assert.equal(
        trilingual.useTranslation('en')('landingIntro'),
        'Agent learning platform, tech blog; full-stack practice, project showcase, long-term learning',
    );
    assert.equal(
        trilingual.useTranslation('zh')('landingIntro'),
        '自主学习平台，科技博客；全栈练习、项目展示、长期回顾和社区学习中心',
    );
    assert.equal(
        trilingual.useTranslation('es')('landingIntro'),
        'Plataforma de aprendizaje agente, blog tecnológico; práctica de full‑stack, exhibición de proyectos, aprendizaje a largo plazo',
    );
});

test('defaults translations to English', () => {
    assert.equal(trilingual.useTranslation()('navigationHome'), 'Home');
    assert.equal(
        trilingual.useTranslation()('landingIntro'),
        'Agent learning platform, tech blog; full-stack practice, project showcase, long-term learning',
    );
});

test('reads language prefixes and defaults unprefixed paths to English', () => {
    assert.equal(trilingual.getLocalFromPathname('/zh/about'), 'zh');
    assert.equal(trilingual.getLocalFromPathname('/es'), 'es');
    assert.equal(trilingual.getLocalFromPathname('/about'), 'en');
});

test('normalizes repeated slashes when stripping a language prefix', () => {
    assert.equal(trilingual.stripLocalFromPathname('///zh///about//'), '/about');
});

test('localizes root and already localized paths without duplicate prefixes', () => {
    assert.equal(trilingual.localizePathname('/', 'zh'), '/zh');
    assert.equal(trilingual.localizePathname('/zh/about', 'en'), '/about');
    assert.equal(trilingual.localizePathname('/zh/about', 'es'), '/es/about');
});

test('returns alternates for every supported language', () => {
    assert.deepEqual(trilingual.getLocalizedAlternates('/about'), {
        en: '/about',
        zh: '/zh/about',
        es: '/es/about',
    });
    assert.deepEqual(trilingual.getLocalizedAlternates('/'), {
        en: '/',
        zh: '/zh',
        es: '/es',
    });
});

test('gets the current language from an explicit pathname', () => {
    assert.equal(trilingual.getCurrentLocal('/zh/about'), 'zh');
});

test('formats dates with the matching locale and UTC default', () => {
    const date = new Date('2024-01-02T00:00:00.000Z');

    assert.equal(trilingual.getDateLocal('en'), 'en');
    assert.equal(trilingual.getDateLocal('zh'), 'zh');
    assert.equal(trilingual.getDateLocal('es'), 'es');
    assert.equal(trilingual.formatDate(date, 'en'), 'January 2, 2024');
    assert.equal(trilingual.formatDate(date, 'zh'), '2024年1月2日');
    assert.equal(trilingual.formatDate(date, 'es'), '2 de enero de 2024');
});