/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const originalResolve = Module._resolveFilename;
const originalTs = require.extensions['.ts'];
const originalTsx = require.extensions['.tsx'];
const compile = (module, filename) => {
    const source = fs.readFileSync(filename, 'utf8');
    const result = ts.transpileModule(source, { compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
    } });
    module._compile(result.outputText, filename);
};

require.extensions['.ts'] = compile;
require.extensions['.tsx'] = compile;
Module._resolveFilename = function (request, parent, isMain, options) {
    return originalResolve.call(this, request.startsWith('@/') ? path.join(root, 'src', request.slice(2)) : request, parent, isMain, options);
};
let navigation;
let MobileMenu;
try {
    navigation = require(path.join(root, 'src', 'components', 'header', 'NavigationMenu.tsx'));
    ({ MobileMenu } = require(path.join(root, 'src', 'components', 'header', 'MobileMenu.tsx')));
} finally {
    Module._resolveFilename = originalResolve;
    if (originalTs) require.extensions['.ts'] = originalTs;
    else delete require.extensions['.ts'];
    if (originalTsx) require.extensions['.tsx'] = originalTsx;
    else delete require.extensions['.tsx'];
}

test('navigation items have translated labels and localized paths', () => {
    for (const [lang, label, href] of [['en', 'Home', '/'], ['zh', '首页', '/zh'], ['es', 'Inicio', '/es']]) {
        const items = navigation.getNavItems(lang);
        assert.equal(items[0].label, label);
        assert.equal(items[0].href, href);
        assert.ok(items.every((item) => typeof item.label === 'string' && item.label.length > 0));
    }
});

test('active matching handles localized paths and nested pages', () => {
    assert.equal(navigation.isNavItemActive('/zh', '/'), true);
    assert.equal(navigation.isNavItemActive('/es/blog/article', '/blog'), true);
    assert.equal(navigation.isNavItemActive('/blogger', '/blog'), false);
});

test('desktop and mobile menus render on the server', () => {
    assert.match(renderToStaticMarkup(React.createElement(navigation.default, { lang: 'en', pathname: '/' })), /Main navigation/);
    assert.match(renderToStaticMarkup(React.createElement(MobileMenu, { pathname: '/' })), /button/);
});