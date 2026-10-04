import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../public/js/arcade-engine.mjs';
test('ship stays inside the playable area', () => {
    const g = new Game(); g.move(-500, 0); assert.deepEqual(g.ship, { x: 24, y: 270 });
    g.move(2000, 1000); assert.deepEqual(g.ship, { x: 976, y: 615 });
});
test('paused game does not advance or spawn hazards', () => {
    const g = new Game(); g.update(.05); assert.equal(g.time, 0); assert.equal(g.bullets.length, 0);
});
test('aliens march and fire, survival earns score', () => {
    const g = new Game(() => 0); g.running = true;
    const x = g.aliens()[0].x;
    for (let i = 0; i < 40; i++) g.update(.05);
    assert.ok(g.score >= 19); assert.ok(g.bullets.length > 0); assert.notEqual(g.aliens()[0].x, x);
});
test('collision removes one life and shield prevents consecutive damage', () => {
    const g = new Game(); g.running = true;
    g.bullets = Array.from({ length: 2 }, () => ({ x: 500, y: 560, vx: 0, vy: 100, radius: 8 }));
    g.update(.01); assert.equal(g.lives, 2); assert.ok(g.shield > 0); assert.equal(g.bullets.length, 1);
    g.update(.01); assert.equal(g.lives, 2);
});
test('dodging avoids damage and missed projectiles are removed', () => {
    const g = new Game(); g.running = true; g.move(800, 560);
    g.bullets = [{ x: 500, y: 560, vx: 0, vy: 100, radius: 8 }, { x: 100, y: 680, vx: 0, vy: 100, radius: 8 }];
    g.update(.05); assert.equal(g.lives, 3); assert.equal(g.bullets.length, 1);
});
test('last hit ends game and restart restores a clean state', () => {
    const g = new Game(); g.running = true; g.lives = 1;
    g.bullets = [{ x: 500, y: 560, vx: 0, vy: 100, radius: 8 }]; g.update(.01);
    assert.equal(g.over, true); assert.equal(g.running, false);
    g.reset(); assert.equal(g.lives, 3); assert.equal(g.score, 0); assert.equal(g.over, false); assert.equal(g.bullets.length, 0);
});
test('firing requires active play and respects cooldown', () => {
    const g = new Game(); assert.equal(g.fire(), false);
    g.running = true; assert.equal(g.fire(), true); assert.equal(g.fire(), false);
    assert.deepEqual(g.shots[0], { x: 500, y: 536 });
    for (let i = 0; i < 5; i++) g.update(.05);
    assert.equal(g.fire(), true); assert.ok(g.shots[0].y < 536);
    g.running = false; const y = g.shots[0].y; g.update(.05);
    assert.equal(g.shots[0].y, y); assert.equal(g.fire(), false);
});
test('shot hits nearest alien once and hit points persist', () => {
    const g = new Game(); g.running = true;
    g.shots = [{ x: 140, y: 208 }]; g.update(.05);
    assert.equal(g.aliens().length, 23); assert.ok(g.destroyed.has(16));
    assert.equal(g.shots.length, 0); assert.equal(g.bonus, 100);
    g.update(.05); assert.equal(g.bonus, 100); assert.ok(g.score >= 100);
});
test('missed shots are removed without damaging aliens', () => {
    const g = new Game(); g.running = true;
    g.shots = [{ x: 20, y: 0 }]; g.update(.05);
    assert.equal(g.shots.length, 0); assert.equal(g.aliens().length, 24); assert.equal(g.bonus, 0);
});
test('clearing formation starts a new wave and restart clears weapon state', () => {
    const g = new Game(); g.running = true;
    g.destroyed = new Set(Array.from({ length: 23 }, (_, i) => i));
    g.shots = [{ x: 840, y: 208 }]; g.update(.05);
    assert.equal(g.wave, 2); assert.equal(g.aliens().length, 24); assert.equal(g.bonus, 100);
    assert.equal(g.bullets.length, 0); assert.equal(g.shots.length, 0);
    g.fire(); g.reset(); assert.equal(g.wave, 1); assert.equal(g.shots.length, 0);
    assert.equal(g.bonus, 0); assert.equal(g.cooldown, 0); assert.equal(g.destroyed.size, 0);
});
