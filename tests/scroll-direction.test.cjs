/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

test('header responds to accumulated scrolling and the top hover zone', () => {
    const listeners = {};
    const states = [];
    const refs = [];
    let stateIndex = 0;
    let refIndex = 0;
    const effects = [];
    const react = {
        useState(initial) {
            const index = stateIndex++;
            if (!(index in states)) states[index] = initial;
            return [states[index], (value) => { states[index] = value; }];
        },
        useRef(initial) {
            const index = refIndex++;
            return refs[index] ??= { current: initial };
        },
        useCallback(callback) { return callback; },
        useEffect(effect) { effects.push(effect); },
    };
    const source = fs.readFileSync(path.join(__dirname, '..', 'hook', 'useScrollDirection.ts'), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const hookModule = new Module('scroll-hook-test', module);
    hookModule.require = (name) => name === 'react' ? react : require(name);
    hookModule._compile(compiled, 'scroll-hook-test');
    const oldWindow = global.window;
    const oldRequest = global.requestAnimationFrame;
    const oldCancel = global.cancelAnimationFrame;
    global.window = {
        scrollY: 0,
        addEventListener(name, callback) { listeners[name] = callback; },
        removeEventListener(name) { delete listeners[name]; },
    };
    global.requestAnimationFrame = (callback) => { callback(); return 1; };
    global.cancelAnimationFrame = () => {};
    try {
        assert.equal(hookModule.exports.useScrollDirection().isVisible, true);
        const cleanup = effects.map((effect) => effect());
        for (const y of [5, 10, 15]) {
            global.window.scrollY = y;
            listeners.scroll();
        }
        assert.equal(states[0], false);
        listeners.mousemove({ clientY: 10 });
        assert.equal(states[0], true);
        global.window.scrollY = 0;
        listeners.scroll();
        assert.equal(states[0], true);
        cleanup.forEach((dispose) => dispose());
        assert.deepEqual(listeners, {});
    } finally {
        global.window = oldWindow;
        global.requestAnimationFrame = oldRequest;
        global.cancelAnimationFrame = oldCancel;
    }
});