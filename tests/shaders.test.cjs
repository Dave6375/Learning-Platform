/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');
const shaderPath = path.join(projectRoot, 'src', 'components', 'plexus-webgl', 'shaders.ts');
const particleFieldPath = path.join(projectRoot, 'src', 'components', 'plexus-webgl', 'ParticleField.tsx');
const source = fs.readFileSync(shaderPath, 'utf8');
const particleFieldSource = fs.readFileSync(particleFieldPath, 'utf8');
const compiled = ts.transpileModule(source, {
    compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
    },
});
const shaderModule = { exports: {} };
new Function('module', 'exports', compiled.outputText)(shaderModule, shaderModule.exports);

const { particleVertexShader, particleFragmentShader, lineVertexShader, lineFragmentShader } = shaderModule.exports;

test('particle shaders initialize position, color, and opacity outputs', () => {
    assert.match(particleVertexShader, /gl_Position\s*=\s*projectionMatrix\s*\*\s*mvPosition/);
    assert.match(particleVertexShader, /vColorT\s*=\s*aColorT/);
    assert.match(particleVertexShader, /vAlpha\s*=\s*1\.0/);
    assert.match(particleVertexShader, /gl_PointSize\s*=\s*aSize\s*\*\s*uPixelRatio/);
    assert.match(particleFragmentShader, /gl_PointCoord/);
    assert.match(particleFragmentShader, /1\.0\s*-\s*smoothstep\(0\.05,\s*0\.5,\s*dist\)/);
    assert.match(particleFragmentShader, /vec4\(color\s*\*\s*hdr,\s*alpha\)/);
});

test('particle fragment shader declares the HDR uniform used by ParticleField', () => {
    assert.match(particleFieldSource, /uHdrIntensity\s*:/);
    assert.match(particleFragmentShader, /uniform\s+float\s+uHdrIntensity\s*;/);
    assert.doesNotMatch(particleFragmentShader, /\buHrIntensity\b/);
});

test('line shaders pass matching varyings and multiply opacity factors', () => {
    for (const shader of [lineVertexShader, lineFragmentShader]) {
        assert.match(shader, /varying\s+float\s+vAlpha/);
        assert.match(shader, /varying\s+float\s+vEnergy/);
        assert.doesNotMatch(shader, /uniform\s+float\s+v(?:Alpha|Energy)/);
    }

    assert.match(lineFragmentShader, /vAlpha\s*\*\s*uOpacity\s*\*\s*\(1\.0\s*-\s*vEnergy\)/);
});

test('shared wave function uses valid GLSL vector and variable names', () => {
    for (const shader of [particleVertexShader, lineVertexShader]) {
        assert.match(shader, /waveEnergy\(vec3\s+pos,\s*float\s+time\)/);
        assert.match(shader, /sin\(pos\.x/);
        assert.doesNotMatch(shader, /\bvex3\b|\bPos\.x\b/);
    }
});