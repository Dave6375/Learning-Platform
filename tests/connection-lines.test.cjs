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

let updateConnectionLines;
try {
    ({ updateConnectionLines } = require(path.join(
        projectRoot,
        'src',
        'components',
        'plexus-webgl',
        'ConnectionLines.tsx',
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

function calculate(positions, particleCount, connectionDistance, maxConnections = 5000) {
    const linePositions = new Float32Array(maxConnections * 6);
    const lineAlphas = new Float32Array(maxConnections * 2);
    const count = updateConnectionLines(
        positions === null ? null : Float32Array.from(positions),
        particleCount,
        connectionDistance,
        linePositions,
        lineAlphas,
        new Int32Array(64 * 64),
        new Int32Array(Math.max(0, particleCount)),
        maxConnections,
    );

    return {
        count,
        positions: linePositions.slice(0, count * 6),
        alphas: lineAlphas.slice(0, count * 2),
    };
}

test('connects nearby particles and writes matching endpoint alpha values', () => {
    const result = calculate([0, 0, 0, 1, 0, 0], 2, 1.5);

    assert.equal(result.count, 1);
    assert.deepEqual(Array.from(result.positions), [0, 0, 0, 1, 0, 0]);
    assert.equal(result.alphas[0], result.alphas[1]);
});

test('does not connect particles outside the distance threshold', () => {
    assert.equal(calculate([0, 0, 0, 5, 0, 0], 2, 1.5).count, 0);
});

test('finds nearby particles on opposite sides of a grid cell boundary', () => {
    const result = calculate([0, 0, 0, 1.3, 0, 0, 1.4, 0, 0, 2.8, 0, 0], 4, 1);

    assert.ok(result.count >= 1);
    assert.ok(Array.from(result.positions).some((value, index, values) =>
        index % 6 === 0 && Math.abs(value - 1.3) < 1e-5 && Math.abs(values[index + 3] - 1.4) < 1e-5,
    ));
});

test('clears connections for missing positions or an invalid distance', () => {
    assert.equal(calculate(null, 2, 1).count, 0);
    assert.equal(calculate([], 2, 1).count, 0);
    assert.equal(calculate([0, 0, 0, 1, 0, 0], 2, 0).count, 0);
    assert.equal(calculate([0, 0, 0, 1, 0, 0], 2, -1).count, 0);
    assert.equal(calculate([0, 0, 0, 1, 0, 0], 2, Number.NaN).count, 0);
});

test('uses the latest connection distance', () => {
    const positions = [0, 0, 0, 1.2, 0, 0];

    assert.equal(calculate(positions, 2, 1).count, 0);
    assert.equal(calculate(positions, 2, 1.5).count, 1);
});

test('respects the maximum connection count', () => {
    const result = calculate([0, 0, 0, 0.5, 0, 0, 1, 0, 0], 3, 2, 1);

    assert.equal(result.count, 1);
    assert.equal(result.positions.length, 6);
});

test('does not read beyond the supplied position buffer', () => {
    const result = calculate([0, 0, 0, 1, 0, 0], 10, 2);

    assert.equal(result.count, 1);
});