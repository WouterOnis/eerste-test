export const DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
};

export function shuffled(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export function createSnake(random = Math.random) {
    const size = 20;
    const game = {
        body: [
            { x: 7, y: 10 },
            { x: 6, y: 10 },
            { x: 5, y: 10 },
        ],
        direction: "right",
        nextDirection: "right",
        score: 0,
        ended: false,
        won: false,
        started: false,
        food: null,
    };
    function placeFood() {
        const free = [];
        for (let y = 0; y < size; y++)
            for (let x = 0; x < size; x++) {
                if (!game.body.some((part) => part.x === x && part.y === y))
                    free.push({ x, y });
            }
        if (!free.length) {
            game.won = true;
            game.ended = true;
            return;
        }
        game.food = free[Math.floor(random() * free.length)];
    }
    game.turn = (direction) => {
        if (!DIRECTIONS[direction]) return;
        const current = DIRECTIONS[game.direction];
        const next = DIRECTIONS[direction];
        if (current.x + next.x === 0 && current.y + next.y === 0) return;
        game.nextDirection = direction;
        game.started = true;
    };
    game.step = () => {
        if (game.ended || !game.started) return;
        game.direction = game.nextDirection;
        const delta = DIRECTIONS[game.direction];
        const head = {
            x: game.body[0].x + delta.x,
            y: game.body[0].y + delta.y,
        };
        const eating = head.x === game.food.x && head.y === game.food.y;
        const collisionBody = eating ? game.body : game.body.slice(0, -1);
        if (
            head.x < 0 ||
            head.x >= size ||
            head.y < 0 ||
            head.y >= size ||
            collisionBody.some((part) => part.x === head.x && part.y === head.y)
        ) {
            game.ended = true;
            return;
        }
        game.body.unshift(head);
        if (eating) {
            game.score += 10;
            placeFood();
        } else game.body.pop();
    };
    placeFood();
    return game;
}

// An original maze, independent of the layout of the original arcade game.
export const MAZE = [
    "###################",
    "#o......#........o#",
    "#.##.##.#.##.##.#.#",
    "#....#....#.....#.#",
    "###..#.##.#.##...##",
    "#....#....#.......#",
    "#.##.###.###.##.#.#",
    "#...............#.#",
    "#.##.#.#####.#....#",
    "#....#.......#....#",
    "#.##.#.#####.#.##.#",
    "#....#....#.......#",
    "###..#.##.#.##.#.##",
    "#....#.........#..#",
    "#.##.###.###.##.#.#",
    "#......#...#......#",
    "#.##.#...#...#.##.#",
    "#o...#.......#...o#",
    "###################",
];

export const PACMAN_STEP_MS = 180;

export function pacmanPosition(previous, current, progress) {
    // Respawning must snap to the start rather than slide through maze walls.
    if (!previous || Math.abs(current.x - previous.x) + Math.abs(current.y - previous.y) > 1)
        return current;
    const fraction = Math.max(0, Math.min(1, progress));
    return {
        x: previous.x + (current.x - previous.x) * fraction,
        y: previous.y + (current.y - previous.y) * fraction,
    };
}

export function createPacman(random = Math.random) {
    const start = { x: 9, y: 9 };
    const ghostStarts = [
        { x: 1, y: 1 },
        { x: 17, y: 1 },
        { x: 17, y: 17 },
    ];
    const pellets = new Map();
    MAZE.forEach((row, y) =>
        [...row].forEach((tile, x) => {
            if (tile !== "#") pellets.set(`${x},${y}`, tile === "o" ? 50 : 10);
        }),
    );
    pellets.delete(`${start.x},${start.y}`);
    const game = {
        player: { ...start },
        ghosts: ghostStarts.map((position) => ({ ...position })),
        pellets,
        score: 0,
        lives: 3,
        direction: "left",
        nextDirection: "left",
        power: 0,
        safe: 20,
        ticks: 0,
        started: false,
        ended: false,
        won: false,
    };
    const open = (x, y) => MAZE[y]?.[x] !== undefined && MAZE[y][x] !== "#";
    game.turn = (direction) => {
        if (DIRECTIONS[direction]) {
            game.nextDirection = direction;
            game.started = true;
        }
    };
    function collide() {
        game.ghosts.forEach((ghost, i) => {
            if (
                ghost.cooldown > 0 ||
                ghost.x !== game.player.x ||
                ghost.y !== game.player.y
            )
                return;
            if (game.power > 0) {
                game.score += 100;
                game.ghosts[i] = { ...ghostStarts[i], cooldown: 24 };
            } else if (game.safe <= 0) {
                game.lives--;
                if (game.lives === 0) game.ended = true;
                game.player = { ...start };
                game.ghosts = ghostStarts.map((position) => ({ ...position }));
                game.safe = 20;
                game.started = false;
            }
        });
    }
    game.step = () => {
        if (!game.started || game.ended) return;
        game.previousPlayer = { ...game.player };
        game.previousGhosts = game.ghosts.map((ghost) => ({ ...ghost }));
        game.ticks++;
        game.ghosts.forEach((ghost) => {
            if (ghost.cooldown > 0) ghost.cooldown--;
        });
        game.power = Math.max(0, game.power - 1);
        game.safe = Math.max(0, game.safe - 1);
        const next = DIRECTIONS[game.nextDirection];
        if (open(game.player.x + next.x, game.player.y + next.y))
            game.direction = game.nextDirection;
        const delta = DIRECTIONS[game.direction];
        if (open(game.player.x + delta.x, game.player.y + delta.y)) {
            game.player.x += delta.x;
            game.player.y += delta.y;
        }
        const key = `${game.player.x},${game.player.y}`;
        if (pellets.has(key)) {
            const points = pellets.get(key);
            game.score += points;
            if (points === 50) game.power = 55;
            pellets.delete(key);
        }
        collide();
        if (game.ticks % 3 === 0 && game.started && !game.ended) {
            game.ghosts = game.ghosts.map((ghost) => {
                if (ghost.cooldown > 0) return ghost;
                const options = Object.values(DIRECTIONS)
                    .map((delta) => ({
                        x: ghost.x + delta.x,
                        y: ghost.y + delta.y,
                    }))
                    .filter((position) => open(position.x, position.y));
                if (!options.length) return ghost;
                const distance = (position) =>
                    Math.abs(position.x - game.player.x) +
                    Math.abs(position.y - game.player.y);
                options.sort((a, b) =>
                    game.power > 0
                        ? distance(b) - distance(a)
                        : distance(a) - distance(b),
                );
                return random() < 0.25
                    ? options[Math.floor(random() * options.length)]
                    : options[0];
            });
            collide();
        }
        if (!pellets.size) {
            game.won = true;
            game.ended = true;
        }
    };
    return game;
}

export function createBreakout() {
    const width = 480,
        height = 380;
    const bricks = [];
    for (let row = 0; row < 4; row++)
        for (let col = 0; col < 8; col++)
            bricks.push({
                x: 14 + col * 57,
                y: 30 + row * 26,
                w: 52,
                h: 18,
                row,
                alive: true,
            });
    const game = {
        paddle: 195,
        ball: { x: 240, y: 331, vx: 2.8, vy: -3.5 },
        bricks,
        lives: 3,
        score: 0,
        ended: false,
        won: false,
        started: false,
        left: false,
        right: false,
    };
    game.move = (x) => {
        game.paddle = Math.max(0, Math.min(width - 90, x - 45));
    };
    game.launch = () => {
        game.started = true;
    };
    game.step = () => {
        if (game.ended) return;
        if (game.left) game.paddle = Math.max(0, game.paddle - 6);
        if (game.right) game.paddle = Math.min(width - 90, game.paddle + 6);
        const ball = game.ball;
        if (!game.started) {
            ball.x = game.paddle + 45;
            ball.y = 331;
            return;
        }
        const previous = { x: ball.x, y: ball.y };
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.x <= 7 || ball.x >= width - 7) {
            ball.vx *= -1;
            ball.x = Math.max(7, Math.min(width - 7, ball.x));
        }
        if (ball.y <= 7) {
            ball.vy = Math.abs(ball.vy);
            ball.y = 7;
        }
        if (
            ball.vy > 0 &&
            previous.y + 7 <= 347 &&
            ball.y + 7 >= 347 &&
            ball.x >= game.paddle - 7 &&
            ball.x <= game.paddle + 97
        ) {
            ball.vy = -Math.abs(ball.vy);
            ball.y = 340;
            ball.vx = ((ball.x - game.paddle - 45) / 45) * 4;
        }
        for (const brick of bricks) {
            if (
                !brick.alive ||
                ball.x + 7 < brick.x ||
                ball.x - 7 > brick.x + brick.w ||
                ball.y + 7 < brick.y ||
                ball.y - 7 > brick.y + brick.h
            )
                continue;
            brick.alive = false;
            game.score += 10;
            if (
                previous.x + 7 <= brick.x ||
                previous.x - 7 >= brick.x + brick.w
            )
                ball.vx *= -1;
            else ball.vy *= -1;
            break;
        }
        if (ball.y > height + 7) {
            game.lives--;
            game.started = false;
            game.ball = { x: game.paddle + 45, y: 331, vx: 2.8, vy: -3.5 };
            if (!game.lives) game.ended = true;
        }
        if (bricks.every((brick) => !brick.alive)) {
            game.won = true;
            game.ended = true;
        }
    };
    return game;
}
