/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const ts = require('typescript');

function load(file, overrides = {}) {
    const filename = path.join(__dirname, '..', 'src', 'components', 'chat', file);
    const source = fs.readFileSync(filename, 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
    } }).outputText;
    const loaded = new Module(filename, module);
    loaded.filename = filename;
    loaded.paths = module.paths;
    loaded.require = (name) => overrides[name] || require(name);
    loaded._compile(code, filename);
    return loaded.exports;
}

test('messages render literal text and preserve line breaks', () => {
    const { ChatMessage } = load('ui/chat-message.tsx');
    const html = renderToStaticMarkup(React.createElement(ChatMessage, { content: '<script>\nHello' }));
    assert.match(html, /&lt;script&gt;\nHello/);
    assert.match(html, /whitespace-pre-wrap/);
});

test('composer handles enter, newlines and composition', () => {
    const { PromptForm } = load('ui/prompt-form.tsx', { '@/components/ui/button': { Button: 'button' } });
    let sent = 0;
    const element = PromptForm({ draft: 'hello', onDraftChange() {}, onSend() { sent++; } });
    const form = element.props.children[1];
    const textarea = form.props.children[0];
    let prevented = 0;
    const event = { key: 'Enter', shiftKey: false, keyCode: 13, nativeEvent: { isComposing: false }, preventDefault() { prevented++; } };
    textarea.props.onKeyDown(event);
    textarea.props.onKeyDown({ ...event, shiftKey: true });
    textarea.props.onKeyDown({ ...event, nativeEvent: { isComposing: true } });
    textarea.props.onKeyDown({ ...event, keyCode: 229 });
    assert.equal(sent, 1);
    assert.equal(prevented, 1);
    form.props.onSubmit(event);
    assert.equal(sent, 2);
});

test('scrolling follows near the bottom but preserves earlier reading position', () => {
    const refs = [];
    let index = 0;
    let effect;
    const react = {
        useRef(initial) { return refs[index++] ||= { current: initial }; },
        useLayoutEffect(callback) { effect = callback; },
    };
    const { useScrollToBottom } = load('hooks/use-scroll-to-bottom.tsx', { react });
    let hook = useScrollToBottom(1);
    const element = { scrollHeight: 1000, clientHeight: 200, scrollTop: 760 };
    hook.scrollRef.current = element;
    hook.onScroll({ currentTarget: element });
    effect();
    assert.equal(element.scrollTop, 1000);
    element.scrollTop = 100;
    hook.onScroll({ currentTarget: element });
    index = 0;
    hook = useScrollToBottom(2);
    element.scrollHeight = 1200;
    effect();
    assert.equal(element.scrollTop, 100);
});