import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { Game, WIDTH, HEIGHT } from '../../public/js/arcade-engine.mjs';

test('space fires without canvas focus, holds, releases and stays inactive when paused', () => {
    const handlers = new Map(), elements = new Map();
    let nextFrame;
    const context = new Proxy({}, { get: (_, key) => key === 'createRadialGradient' ? () => ({ addColorStop() {} }) : () => {} });
    const document = {
        activeElement: null,
        createElement: () => ({ getContext: () => context }),
        getElementById(id) {
            if (!elements.has(id)) elements.set(id, {
                handlers: {},
                addEventListener(name, fn) { this.handlers[name] = fn; },
                getContext: () => context,
                getBoundingClientRect: () => ({ width: 1000, height: 650 }),
                setAttribute() {}, focus() { document.activeElement = this; },
            });
            return elements.get(id);
        },
        addEventListener() {},
    };
    const source = readFileSync(new URL('../../public/js/arcade.js', import.meta.url), 'utf8').replace(/^import[^\n]+\n/, '');
    let shots = 0;
    class ObservedGame extends Game {
        fire() { const fired = super.fire(); if (fired) shots++; return fired; }
    }
    runInNewContext(source, {
        Game: ObservedGame, WIDTH, HEIGHT, document,
        window: { addEventListener(name, fn) { handlers.set(name, fn); } },
        matchMedia: () => ({ matches: false, addEventListener() {} }),
        localStorage: { getItem: () => null }, devicePixelRatio: 1,
        performance: { now: () => 0 },
        requestAnimationFrame: fn => { nextFrame = fn; },
    });
    elements.get('start').handlers.click();
    // Moving onto the HUD or transferring focus within the preview must not pause.
    elements.get('arena')?.handlers.pointerleave?.({ pointerType: 'mouse' });
    elements.get('game').handlers.blur?.({ relatedTarget: null });
    // A document-level keyboard event must work without a focused canvas.
    document.activeElement = null;
    let prevented = 0;
    const space = { code: 'Space', key: 'Unidentified', preventDefault() { prevented++; } };
    handlers.get('keydown')(space);
    assert.equal(prevented, 1); assert.equal(shots, 1);
    for (let now = 50; now <= 500; now += 50) nextFrame(now);
    assert.ok(shots >= 2);
    handlers.get('keyup')(space);
    const released = shots;
    for (let now = 550; now <= 1000; now += 50) nextFrame(now);
    assert.equal(shots, released);
    handlers.get('keydown')({ key: 'Escape', preventDefault() {} });
    handlers.get('keydown')(space);
    assert.equal(shots, released); assert.equal(prevented, 1);
});
