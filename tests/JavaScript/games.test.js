import { test } from "node:test";
import assert from "node:assert/strict";
import {
    createSnake,
    createBreakout,
    createPacman,
    pacmanPosition,
    MAZE,
    shuffled,
} from "../../resources/js/games.js";

test("Snake waits for input, disallows reversal, eats and grows", () => {
    const game = createSnake(() => 0);
    game.step();
    assert.deepEqual(game.body[0], { x: 7, y: 10 });
    game.turn("left");
    assert.equal(game.started, false);
    game.food = { x: 8, y: 10 };
    game.turn("right");
    game.step();
    assert.equal(game.score, 10);
    assert.equal(game.body.length, 4);
    assert.ok(
        !game.body.some(
            (part) => part.x === game.food.x && part.y === game.food.y,
        ),
    );
});

test("Snake ends at a wall and on its own body, but can enter the vacated tail", () => {
    const wall = createSnake();
    wall.turn("right");
    for (let i = 0; i < 20; i++) wall.step();
    assert.equal(wall.ended, true);
    const self = createSnake();
    self.body = [
        { x: 5, y: 5 },
        { x: 5, y: 4 },
        { x: 4, y: 4 },
        { x: 4, y: 5 },
    ];
    self.direction = "left";
    self.turn("up");
    self.step();
    assert.equal(self.ended, true);
    const tail = createSnake();
    tail.body = [
        { x: 5, y: 5 },
        { x: 5, y: 4 },
        { x: 4, y: 4 },
        { x: 4, y: 5 },
    ];
    tail.direction = "down";
    tail.turn("left");
    tail.step();
    assert.equal(tail.ended, false);
    assert.deepEqual(tail.body[0], { x: 4, y: 5 });
});

test("Every Pacman pellet is reachable from the starting position", () => {
    assert.ok(MAZE.every((row) => row.length === 19));
    const visited = new Set(["9,9"]),
        queue = [[9, 9]];
    while (queue.length) {
        const [x, y] = queue.shift();
        for (const [dx, dy] of [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
        ]) {
            const nx = x + dx,
                ny = y + dy,
                key = `${nx},${ny}`;
            if (MAZE[ny]?.[nx] && MAZE[ny][nx] !== "#" && !visited.has(key)) {
                visited.add(key);
                queue.push([nx, ny]);
            }
        }
    }
    const game = createPacman();
    assert.ok([...game.pellets.keys()].every((key) => visited.has(key)));
});

test("Pacman consumes pellets once and is blocked by walls", () => {
    const game = createPacman(() => 0.5);
    game.turn("up");
    game.step();
    assert.deepEqual(game.player, { x: 8, y: 9 });
    assert.equal(game.score, 10);
    game.turn("right");
    game.step();
    assert.deepEqual(game.player, { x: 9, y: 9 });
    assert.equal(game.score, 10);
    game.player = { x: 1, y: 1 };
    game.direction = "left";
    game.turn("left");
    game.step();
    assert.deepEqual(game.player, { x: 1, y: 1 });
    assert.equal(game.power, 55);
});

test("Pacman collisions remove a life; power pellets allow eating ghosts", () => {
    const game = createPacman(() => 0.5);
    game.safe = 0;
    game.ghosts = [{ x: 8, y: 9 }];
    game.turn("left");
    game.step();
    assert.equal(game.lives, 2);
    assert.equal(game.started, false);
    const powered = createPacman(() => 0.5);
    powered.safe = 0;
    powered.power = 20;
    powered.ghosts = [{ x: 8, y: 9 }];
    powered.turn("left");
    powered.step();
    assert.equal(powered.lives, 3);
    assert.equal(powered.score, 110);
    assert.equal(powered.ghosts[0].cooldown, 24);
});

test("Pacman wins when the final pellet is collected", () => {
    const game = createPacman();
    game.pellets.clear();
    game.pellets.set("8,9", 10);
    game.turn("left");
    game.step();
    assert.equal(game.won, true);
    assert.equal(game.ended, true);
});

test("Breakout respects paddle bounds, bounces and destroys bricks", () => {
    const game = createBreakout();
    game.move(-100);
    assert.equal(game.paddle, 0);
    game.move(1000);
    assert.equal(game.paddle, 390);
    game.move(240);
    game.launch();
    game.ball = { x: 240, y: 338, vx: 0, vy: 4 };
    game.step();
    assert.ok(game.ball.vy < 0);
    game.ball = { x: 35, y: 54, vx: 0, vy: -4 };
    game.step();
    assert.equal(game.score, 10);
    assert.equal(game.bricks[0].alive, false);
});

test("Breakout stops after three lost balls and wins after the last brick", () => {
    const game = createBreakout();
    for (let i = 0; i < 3; i++) {
        game.launch();
        game.ball.y = 389;
        game.ball.vy = 4;
        game.step();
    }
    assert.equal(game.lives, 0);
    assert.equal(game.ended, true);
    const win = createBreakout();
    win.bricks.forEach((brick, i) => (brick.alive = i === 0));
    win.launch();
    win.ball = { x: 35, y: 54, vx: 0, vy: -4 };
    win.step();
    assert.equal(win.won, true);
    assert.equal(win.ended, true);
});

test("Memory shuffle preserves each pair without changing the input", () => {
    const input = [1, 1, 2, 2, 3, 3, 4, 4];
    const result = shuffled(input, () => 0.3);
    assert.notDeepEqual(result, input);
    assert.deepEqual([...result].sort(), input);
    assert.deepEqual(input, [1, 1, 2, 2, 3, 3, 4, 4]);
});

test("Pacman draws intermediate positions without moving the collision grid", () => {
    const game = createPacman(() => 0.5);
    game.turn("left");
    game.step();
    assert.deepEqual(pacmanPosition(game.previousPlayer, game.player, 0), { x: 9, y: 9 });
    assert.deepEqual(pacmanPosition(game.previousPlayer, game.player, 0.5), { x: 8.5, y: 9 });
    assert.deepEqual(pacmanPosition(game.previousPlayer, game.player, 1), { x: 8, y: 9 });
    assert.deepEqual(game.player, { x: 8, y: 9 });
    assert.deepEqual(pacmanPosition({ x: 1, y: 1 }, game.player, 0.5), game.player);
    assert.deepEqual(pacmanPosition(game.player, game.player, 0.5), game.player);
});
