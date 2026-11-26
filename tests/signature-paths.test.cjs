/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');
const originalTsExtension = require.extensions['.ts'];
const originalTsxExtension = require.extensions['.tsx'];
const originalResolveFilename = Module._resolveFilename;

const compileTypeScript = (module, filename) => {
    const source = require('node:fs').readFileSync(filename, 'utf8');
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

let SIGNATURE_ANEX_PATHS;
let SIGNATURE_CHRONOS_PATHS;
let SIGNATURE_ANEX;
let SIGNATURE_CHRONOS;
let getHeroPatternAdapter;
try {
    ({ SIGNATURE_ANEX_PATHS, SIGNATURE_CHRONOS_PATHS } = require(path.join(
        projectRoot,
        'src',
        'components',
        'plexus-webgl',
        'signature-paths.ts',
    )));
    ({ SIGNATURE_ANEX, SIGNATURE_CHRONOS } = require(path.join(
        projectRoot,
        'src',
        'components',
        'plexus-webgl',
        'plexus-shapes.tsx',
    )));
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

const signaturePaths = {
    Chronos: SIGNATURE_CHRONOS_PATHS,
    ANEX: SIGNATURE_ANEX_PATHS,
};

test('Chronos and ANEX paths contain distinct curved finite 3D strokes', () => {
    for (const [name, paths] of Object.entries(signaturePaths)) {
        assert.ok(paths.length > 0, `${name} should have at least one stroke`);

        for (const [strokeIndex, stroke] of paths.entries()) {
            assert.ok(stroke.length > 2, `${name} stroke ${strokeIndex} should have curve samples`);
            assert.ok(stroke.every(({ x, y, z }) => Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)));
            assert.ok(new Set(stroke.map(({ z }) => z)).size > 1, `${name} stroke ${strokeIndex} should have depth`);

            const [start, end] = [stroke[0], stroke.at(-1)];
            const baselineLength = Math.hypot(end.x - start.x, end.y - start.y);
            const maxDeviation = Math.max(...stroke.map((point) =>
                Math.abs((end.x - start.x) * (start.y - point.y) - (start.x - point.x) * (end.y - start.y)) /
                    Math.max(baselineLength, Number.EPSILON),
            ));
            assert.ok(maxDeviation > 0.01, `${name} stroke ${strokeIndex} should curve`);
        }
    }

    assert.notDeepEqual(SIGNATURE_CHRONOS_PATHS, SIGNATURE_ANEX_PATHS);
});

test('signature shapes generate the requested number of normalized particle targets', () => {
    for (const shape of [SIGNATURE_CHRONOS, SIGNATURE_ANEX]) {
        for (const count of [1, 37, 512]) {
            const points = shape.generate(count);

            assert.equal(points.length, count);
            assert.ok(points.every(({ x, y, z }) =>
                Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z) &&
                Math.abs(x) <= 1.001 && Math.abs(y) <= 1.001 && Math.abs(z) <= 1.001,
            ));
        }
    }
});

test('signature catalog entries select Chronos in English and ANEX in Chinese', () => {
    const adapter = getHeroPatternAdapter('signature');

    assert.equal(adapter.entries[0].name.en, 'Signature · Chronos');
    assert.equal(adapter.entries[0].shape, SIGNATURE_CHRONOS);
    assert.equal(adapter.entriesZh[0].name.en, 'Signature · ANEX');
    assert.equal(adapter.entriesZh[0].shape, SIGNATURE_ANEX);
});
