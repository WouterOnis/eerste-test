import { shuffled } from "./games.js";

export const TETROMINOES = [
    [[1, 1, 1, 1]],
    [
        [2, 2],
        [2, 2],
    ],
    [
        [0, 3, 0],
        [3, 3, 3],
    ],
    [
        [0, 4, 4],
        [4, 4, 0],
    ],
    [
        [5, 5, 0],
        [0, 5, 5],
    ],
    [
        [6, 0, 0],
        [6, 6, 6],
    ],
    [
        [0, 0, 7],
        [7, 7, 7],
    ],
];

export function createTetris(random = Math.random) {
    let bag = [];
    const pick = () => {
        if (!bag.length) bag = shuffled(TETROMINOES, random);
        return bag.pop().map((row) => [...row]);
    };
    const game = {
        board: Array.from({ length: 20 }, () => Array(10).fill(0)),
        piece: null,
        next: pick(),
        x: 3,
        y: 0,
        score: 0,
        lines: 0,
        level: 1,
        ended: false,
        started: true,
    };
    game.fits = (piece, x, y) =>
        piece.every((row, dy) =>
            row.every(
                (value, dx) =>
                    !value ||
                    (x + dx >= 0 &&
                        x + dx < 10 &&
                        y + dy >= 0 &&
                        y + dy < 20 &&
                        game.board[y + dy][x + dx] === 0),
            ),
        );
    function spawn() {
        game.piece = game.next;
        game.next = pick();
        game.x = Math.floor((10 - game.piece[0].length) / 2);
        game.y = 0;
        if (!game.fits(game.piece, game.x, game.y)) game.ended = true;
    }
    function lock() {
        game.piece.forEach((row, dy) =>
            row.forEach((value, dx) => {
                if (value) game.board[game.y + dy][game.x + dx] = value;
            }),
        );
        const remaining = game.board.filter((row) =>
            row.some((value) => !value),
        );
        const cleared = 20 - remaining.length;
        game.score += [0, 100, 300, 500, 800][cleared] * game.level;
        game.lines += cleared;
        game.level = Math.floor(game.lines / 10) + 1;
        game.board = [
            ...Array.from({ length: cleared }, () => Array(10).fill(0)),
            ...remaining,
        ];
        spawn();
    }
    game.move = (dx) => {
        if (!game.ended && game.fits(game.piece, game.x + dx, game.y))
            game.x += dx;
    };
    game.rotate = () => {
        if (game.ended) return;
        const rotated = game.piece[0].map((_, x) =>
            game.piece.map((row) => row[x]).reverse(),
        );
        for (const offset of [0, -1, 1, -2, 2]) {
            if (game.fits(rotated, game.x + offset, game.y)) {
                game.piece = rotated;
                game.x += offset;
                return;
            }
        }
    };
    game.drop = (hard = false) => {
        if (game.ended) return;
        if (hard) {
            while (game.fits(game.piece, game.x, game.y + 1)) {
                game.y++;
                game.score += 2;
            }
            lock();
        } else if (game.fits(game.piece, game.x, game.y + 1)) {
            game.y++;
            game.score++;
        } else lock();
    };
    game.step = () => {
        if (game.ended) return;
        if (game.fits(game.piece, game.x, game.y + 1)) game.y++;
        else lock();
    };
    spawn();
    return game;
}

export function createPong() {
    const width = 480,
        height = 360,
        paddleHeight = 70;
    const game = {
        player: 145,
        opponent: 145,
        ball: { x: 240, y: 180, vx: -3.7, vy: 2.3 },
        score: 0,
        opponentScore: 0,
        started: false,
        ended: false,
        won: false,
        up: false,
        down: false,
    };
    game.move = (y) => {
        game.player = Math.max(
            0,
            Math.min(height - paddleHeight, y - paddleHeight / 2),
        );
    };
    game.launch = () => {
        if (!game.ended) game.started = true;
    };
    function serve(direction) {
        game.started = false;
        game.ball = {
            x: width / 2,
            y: height / 2,
            vx: direction * 3.7,
            vy: 2.3,
        };
        if (game.score >= 5 || game.opponentScore >= 5) {
            game.ended = true;
            game.won = game.score >= 5;
        }
    }
    game.step = () => {
        if (game.ended) return;
        if (game.up) game.player = Math.max(0, game.player - 6);
        if (game.down)
            game.player = Math.min(height - paddleHeight, game.player + 6);
        if (!game.started) return;
        const ball = game.ball,
            previousX = ball.x;
        const target =
            ball.vx > 0
                ? ball.y - paddleHeight / 2
                : height / 2 - paddleHeight / 2;
        game.opponent = Math.max(
            0,
            Math.min(
                height - paddleHeight,
                game.opponent +
                    Math.max(-2.7, Math.min(2.7, target - game.opponent)),
            ),
        );
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.y <= 6 || ball.y >= height - 6) {
            ball.vy *= -1;
            ball.y = Math.max(6, Math.min(height - 6, ball.y));
        }
        const hitPlayer =
            ball.vx < 0 &&
            previousX - 6 >= 26 &&
            ball.x - 6 <= 26 &&
            ball.y >= game.player - 6 &&
            ball.y <= game.player + paddleHeight + 6;
        const hitOpponent =
            ball.vx > 0 &&
            previousX + 6 <= 454 &&
            ball.x + 6 >= 454 &&
            ball.y >= game.opponent - 6 &&
            ball.y <= game.opponent + paddleHeight + 6;
        if (hitPlayer || hitOpponent) {
            const paddle = hitPlayer ? game.player : game.opponent;
            ball.vx =
                (hitPlayer ? 1 : -1) * Math.min(Math.abs(ball.vx) + 0.35, 8);
            ball.vy =
                ((ball.y - paddle - paddleHeight / 2) / (paddleHeight / 2)) * 5;
            ball.x = hitPlayer ? 32 : 448;
        }
        if (ball.x < -6) {
            game.opponentScore++;
            serve(1);
        } else if (ball.x > width + 6) {
            game.score++;
            serve(-1);
        }
    };
    return game;
}

export function createInvaders(random = Math.random) {
    const enemies = [];
    for (let row = 0; row < 4; row++)
        for (let col = 0; col < 8; col++)
            enemies.push({
                x: 50 + col * 46,
                y: 40 + row * 34,
                alive: true,
                row,
            });
    const game = {
        player: 240,
        enemies,
        shots: [],
        enemyShots: [],
        score: 0,
        lives: 3,
        ticks: 0,
        direction: 1,
        cooldown: 0,
        safe: 0,
        left: false,
        right: false,
        firing: false,
        started: false,
        ended: false,
        won: false,
    };
    game.move = (x) => {
        game.player = Math.max(18, Math.min(462, x));
    };
    game.fire = () => {
        if (game.ended) return;
        game.started = true;
        if (game.cooldown > 0) return;
        game.shots.push({ x: game.player, y: 388 });
        game.cooldown = 14;
    };
    game.step = () => {
        if (game.ended) return;
        if (game.left) game.move(game.player - 5);
        if (game.right) game.move(game.player + 5);
        game.cooldown = Math.max(0, game.cooldown - 1);
        game.safe = Math.max(0, game.safe - 1);
        if (game.firing) game.fire();
        if (!game.started) return;
        game.ticks++;
        const alive = enemies.filter((enemy) => enemy.alive);
        const speed = 0.3 + (32 - alive.length) * 0.02;
        if (
            alive.some(
                (enemy) =>
                    enemy.x + game.direction * speed < 18 ||
                    enemy.x + game.direction * speed > 462,
            )
        ) {
            game.direction *= -1;
            alive.forEach((enemy) => (enemy.y += 13));
        }
        alive.forEach((enemy) => (enemy.x += game.direction * speed));
        if (game.ticks % 65 === 0 && alive.length) {
            // Only the bottom alien in a column fires, making each shot visible.
            const candidates = alive.filter(
                (enemy) =>
                    !alive.some(
                        (other) =>
                            Math.abs(other.x - enemy.x) < 5 &&
                            other.y > enemy.y,
                    ),
            );
            const shooter =
                candidates[Math.floor(random() * candidates.length)];
            game.enemyShots.push({ x: shooter.x, y: shooter.y + 13 });
        }
        game.shots.forEach((shot) => {
            shot.y -= 7;
            const hit = enemies.find(
                (enemy) =>
                    enemy.alive &&
                    Math.abs(enemy.x - shot.x) < 16 &&
                    Math.abs(enemy.y - shot.y) < 13,
            );
            if (hit) {
                hit.alive = false;
                game.score += 20;
                shot.y = -20;
            }
        });
        game.enemyShots.forEach((shot) => {
            shot.y += 3;
            if (
                game.safe === 0 &&
                Math.abs(shot.x - game.player) < 17 &&
                shot.y >= 385 &&
                shot.y <= 410
            ) {
                game.lives--;
                game.safe = 90;
                shot.y = 500;
                if (!game.lives) game.ended = true;
            }
        });
        game.shots = game.shots.filter((shot) => shot.y > 0);
        game.enemyShots = game.enemyShots.filter((shot) => shot.y < 430);
        if (enemies.some((enemy) => enemy.alive && enemy.y >= 375))
            game.ended = true;
        if (enemies.every((enemy) => !enemy.alive)) {
            game.won = true;
            game.ended = true;
        }
    };
    return game;
}

export function create2048(random = Math.random) {
    const game = {
        board: Array.from({ length: 4 }, () => Array(4).fill(0)),
        score: 0,
        ended: false,
        won: false,
    };
    function addTile() {
        const empty = [];
        game.board.forEach((row, y) =>
            row.forEach((value, x) => {
                if (!value) empty.push({ x, y });
            }),
        );
        if (!empty.length) return;
        const cell = empty[Math.floor(random() * empty.length)];
        game.board[cell.y][cell.x] = random() < 0.9 ? 2 : 4;
    }
    const hasMoves = () =>
        game.board.some((row, y) =>
            row.some(
                (value, x) =>
                    value === 0 ||
                    game.board[y][x + 1] === value ||
                    game.board[y + 1]?.[x] === value,
            ),
        );
    game.turn = (direction) => {
        if (game.ended || !["left", "right", "up", "down"].includes(direction))
            return false;
        const before = JSON.stringify(game.board);
        for (let line = 0; line < 4; line++) {
            const positions = Array.from({ length: 4 }, (_, i) =>
                direction === "left"
                    ? [line, i]
                    : direction === "right"
                      ? [line, 3 - i]
                      : direction === "up"
                        ? [i, line]
                        : [3 - i, line],
            );
            const values = positions
                .map(([y, x]) => game.board[y][x])
                .filter(Boolean);
            const merged = [];
            for (let i = 0; i < values.length; i++) {
                if (values[i] === values[i + 1]) {
                    const value = values[i] * 2;
                    merged.push(value);
                    game.score += value;
                    i++;
                } else merged.push(values[i]);
            }
            while (merged.length < 4) merged.push(0);
            positions.forEach(([y, x], i) => {
                game.board[y][x] = merged[i];
            });
        }
        const changed = before !== JSON.stringify(game.board);
        if (changed) addTile();
        game.won = game.board.some((row) => row.some((value) => value >= 2048));
        game.ended = game.won || !hasMoves();
        return changed;
    };
    addTile();
    addTile();
    return game;
}
