import { createTetris, createPong, createInvaders } from "../../resources/js/arcade-games.js";
import { renderTetris, renderPong, renderInvaders } from "../../resources/js/arcade-renderers.js";
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAsteroids, createFrogger, renderAsteroids, renderFrogger } from '../../resources/js/extra-games.js';

test('Asteroids waits for input, wraps, brakes and limits firing', () => {
    const game = createAsteroids(() => 0.5);
    game.step();
    assert.equal(game.safe, 120);
    game.up = true; game.step();
    assert.ok(game.ship.vy < 0);
    game.up = false; game.ship.x = 479; game.ship.vx = 3; game.step();
    assert.ok(game.ship.x < 4);
    game.down = true;
    const speed = Math.hypot(game.ship.vx, game.ship.vy);
    game.step();
    assert.ok(Math.hypot(game.ship.vx, game.ship.vy) < speed);
    game.fire(); game.fire();
    assert.equal(game.shots.length, 1);
});

test('Asteroids splits rocks, scores hits and starts a new wave', () => {
    const game = createAsteroids(() => 0.5);
    game.started = true;
    game.rocks = [{ x: 50, y: 50, vx: 0, vy: 0, radius: 30 }];
    game.shots = [{ x: 50, y: 50, vx: 0, vy: 0, life: 10 }];
    game.step();
    assert.equal(game.rocks.length, 2);
    assert.equal(game.score, 20);
    assert.ok(game.rocks.every((rock) => rock.radius === 15));
    game.rocks = []; game.step();
    assert.equal(game.level, 2);
    assert.equal(game.rocks.length, 5);
});

test('Asteroids loses one life per collision and ends after three', () => {
    const game = createAsteroids(() => 0.5);
    game.started = true;
    for (let i = 0; i < 3; i++) {
        game.safe = 0;
        game.rocks = [{ x: 240, y: 220, vx: 0, vy: 0, radius: 30 }];
        game.step();
        assert.equal(game.lives, 2 - i);
        game.step();
        assert.equal(game.lives, 2 - i);
    }
    assert.equal(game.ended, true);
    game.fire(); assert.equal(game.shots.length, 0);
});

test('Frogger waits, bounds movement and prevents immediate repeated hops', () => {
    const game = createFrogger();
    game.step(); assert.equal(game.remaining, 1800);
    game.turn('down'); assert.equal(game.player.row, 10);
    game.turn('left'); assert.equal(game.player.x, 240);
    for (let i = 0; i < 8; i++) game.step();
    game.turn('left'); assert.equal(game.player.x, 208);
});

test('Frogger detects traffic, drowning, river drift and timeouts', () => {
    const game = createFrogger(); game.started = true;
    game.player = { x: 70, row: 6 }; game.step();
    assert.equal(game.lives, 2);
    game.player = { x: 170, row: 2 }; game.step();
    assert.equal(game.lives, 1);
    game.player = { x: 70, row: 2 }; game.step();
    assert.equal(game.player.x, 70.7);
    game.remaining = 1; game.step();
    assert.equal(game.lives, 0); assert.equal(game.ended, true);
    game.turn('up'); assert.equal(game.player.row, 10);
});

test('Frogger rejects occupied homes and wins with five different homes', () => {
    const game = createFrogger(); game.started = true;
    game.player = { x: 48, row: 1 }; game.step();
    assert.equal(game.score, 100);
    game.player = { x: 48, row: 1 }; game.step();
    assert.equal(game.lives, 2); assert.equal(game.score, 100);
    for (let i = 1; i < 5; i++) {
        game.player = { x: 48 + 96 * i, row: 1 }; game.step();
    }
    assert.equal(game.won, true); assert.equal(game.ended, true);
    assert.equal(game.score, 500);
});

test('Lit arcade renderers support initial and active game states', () => {
    let calls = 0;
    const context = new Proxy({}, {
        get: (_, name) => {
            if (name === 'createLinearGradient' || name === 'createRadialGradient')
                return () => ({ addColorStop() {} });
            return () => { calls++; };
        },
        set: () => true,
    });
    const asteroids = createAsteroids(() => 0.5);
    renderAsteroids(context, asteroids, 0);
    asteroids.up = true; asteroids.fire(); asteroids.step();
    renderAsteroids(context, asteroids, 200);
    renderFrogger(context, createFrogger());
    renderTetris(context, createTetris(() => 0.5));
    renderPong(context, createPong());
    renderInvaders(context, createInvaders(() => 0.5), 0);
    assert.ok(calls > 100);
});
