import { test } from "node:test";
import assert from "node:assert/strict";
import {
    createTetris,
    createPong,
    createInvaders,
    create2048,
} from "../../resources/js/arcade-games.js";

test("Tetris blocks respect walls and rotate without entering occupied cells", () => {
    const game = createTetris(() => 0.5);
    for (let i = 0; i < 20; i++) game.move(-1);
    assert.equal(game.x, 0);
    game.rotate();
    assert.equal(game.fits(game.piece, game.x, game.y), true);
    for (let i = 0; i < 20; i++) game.move(1);
    assert.equal(game.fits(game.piece, game.x, game.y), true);
    assert.ok(game.x + game.piece[0].length <= 10);
});

test("Tetris clears a completed line and scores a hard drop", () => {
    const game = createTetris(() => 0.5);
    game.board[19] = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0];
    game.piece = [[1, 1, 1, 1]];
    game.x = 6;
    game.y = 0;
    game.drop(true);
    assert.equal(game.lines, 1);
    assert.equal(game.score, 138);
    assert.ok(game.board[19].every((value) => value === 0));
    assert.equal(game.board.length, 20);
});

test("Tetris loses when a new piece cannot spawn and stops after game over", () => {
    const game = createTetris(() => 0.5);
    game.board[0][4] = 1;
    game.next = [
        [2, 2],
        [2, 2],
    ];
    game.piece = [[1]];
    game.x = 0;
    game.y = 19;
    game.step();
    assert.equal(game.ended, true);
    const before = JSON.stringify(game.board);
    game.drop(true);
    game.rotate();
    assert.equal(JSON.stringify(game.board), before);
});

test("Pong waits for a serve, clamps the paddle and bounces off it", () => {
    const game = createPong();
    game.step();
    assert.equal(game.ball.x, 240);
    game.move(-100);
    assert.equal(game.player, 0);
    game.move(1000);
    assert.equal(game.player, 290);
    game.move(180);
    game.launch();
    game.ball = { x: 34, y: 180, vx: -4, vy: 0 };
    game.step();
    assert.ok(game.ball.vx > 0);
    assert.equal(game.opponentScore, 0);
});

test("Pong requires five points to win or lose and waits between rallies", () => {
    const win = createPong();
    for (let i = 0; i < 5; i++) {
        win.launch();
        win.ball = { x: 486, y: 20, vx: 4, vy: 0 };
        win.step();
        assert.equal(win.started, false);
    }
    assert.equal(win.score, 5);
    assert.equal(win.won, true);
    assert.equal(win.ended, true);
    const lose = createPong();
    lose.opponentScore = 4;
    lose.launch();
    lose.ball = { x: -6, y: 20, vx: -4, vy: 0 };
    lose.step();
    assert.equal(lose.ended, true);
    assert.equal(lose.won, false);
});

test("Space Invaders destroys aliens, scores hits and limits fire rate", () => {
    const game = createInvaders(() => 0);
    game.fire();
    game.fire();
    assert.equal(game.shots.length, 1);
    game.shots = [{ x: game.enemies[0].x, y: game.enemies[0].y + 7 }];
    game.step();
    assert.equal(game.enemies[0].alive, false);
    assert.equal(game.score, 20);
    game.move(2000);
    assert.equal(game.player, 462);
    game.move(-2000);
    assert.equal(game.player, 18);
});

test("Space Invaders gives temporary protection after a hit and ends at zero lives", () => {
    const game = createInvaders();
    game.fire();
    game.enemyShots = [
        { x: 240, y: 384 },
        { x: 240, y: 384 },
    ];
    game.step();
    assert.equal(game.lives, 2);
    assert.ok(game.safe > 0);
    game.safe = 0;
    game.lives = 1;
    game.enemyShots = [{ x: 240, y: 384 }];
    game.step();
    assert.equal(game.ended, true);
    assert.equal(game.lives, 0);
});

test("Space Invaders wins when all aliens are gone and loses if aliens land", () => {
    const win = createInvaders();
    win.enemies.forEach((enemy) => (enemy.alive = false));
    win.fire();
    win.step();
    assert.equal(win.won, true);
    assert.equal(win.ended, true);
    const lose = createInvaders();
    lose.enemies[0].y = 380;
    lose.fire();
    lose.step();
    assert.equal(lose.ended, true);
    assert.equal(lose.won, false);
});

test("2048 merges each tile once, counts points and adds exactly one new tile", () => {
    const game = create2048(() => 0);
    game.board = [
        [2, 2, 2, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];
    assert.equal(game.turn("left"), true);
    assert.deepEqual(game.board[0], [4, 4, 2, 0]);
    assert.equal(game.score, 8);
    assert.equal(game.board.flat().filter(Boolean).length, 3);
});

test("2048 leaves an unchanged move alone and supports vertical merges", () => {
    const game = create2048(() => 0);
    game.board = [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];
    const before = JSON.stringify(game.board);
    assert.equal(game.turn("left"), false);
    assert.equal(JSON.stringify(game.board), before);
    game.board[1][0] = 2;
    game.turn("down");
    assert.equal(game.board[3][0], 4);
    assert.equal(game.score, 4);
});

test("2048 wins at the target and distinguishes a full board from no legal moves", () => {
    const game = create2048(() => 0);
    game.board[0] = [1024, 1024, 0, 0];
    game.turn("left");
    assert.equal(game.won, true);
    assert.equal(game.ended, true);
    const lose = create2048();
    lose.board = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2],
    ];
    lose.turn("up");
    assert.equal(lose.ended, true);
    assert.equal(lose.won, false);
    const playable = create2048();
    playable.board = [
        [2, 2, 4, 8],
        [4, 8, 16, 32],
        [8, 16, 32, 64],
        [16, 32, 64, 128],
    ];
    playable.turn("up");
    assert.equal(playable.ended, false);
});
