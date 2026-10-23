import { raised, sphere, backdrop, gradient } from "./game-drawing.js";

const wrap = (value, size) => ((value % size) + size) % size;

export function createAsteroids(random = Math.random) {
    const game = {
        ship: { x: 240, y: 220, angle: -Math.PI / 2, vx: 0, vy: 0 },
        rocks: [], shots: [], score: 0, lives: 3, level: 0,
        safe: 120, cooldown: 0, started: false, ended: false,
        left: false, right: false, up: false, down: false, firing: false,
    };
    function wave() {
        game.level++;
        for (let i = 0; i < game.level + 3; i++) {
            game.rocks.push({ x: i % 2 ? 460 : 20, y: random() * 440,
                vx: (random() - 0.5) * 2, vy: (random() - 0.5) * 2, radius: 30 });
        }
    }
    game.fire = () => {
        if (game.ended) return;
        game.started = true;
        if (game.cooldown) return;
        const { x, y, angle, vx, vy } = game.ship;
        game.shots.push({ x, y, vx: Math.cos(angle) * 6 + vx,
            vy: Math.sin(angle) * 6 + vy, life: 65 });
        game.cooldown = 14;
    };
    game.step = () => {
        if (game.ended) return;
        if (game.left || game.right || game.up || game.down) game.started = true;
        if (!game.started) return;
        const ship = game.ship;
        game.safe = Math.max(0, game.safe - 1);
        game.cooldown = Math.max(0, game.cooldown - 1);
        ship.angle += (Number(game.right) - Number(game.left)) * 0.055;
        if (game.up) {
            ship.vx += Math.cos(ship.angle) * 0.09;
            ship.vy += Math.sin(ship.angle) * 0.09;
        }
        const drag = game.down ? 0.94 : 0.993;
        ship.vx *= drag; ship.vy *= drag;
        const speed = Math.hypot(ship.vx, ship.vy);
        if (speed > 4) { ship.vx *= 4 / speed; ship.vy *= 4 / speed; }
        ship.x = wrap(ship.x + ship.vx, 480);
        ship.y = wrap(ship.y + ship.vy, 440);
        if (game.firing) game.fire();
        game.rocks.forEach((rock) => {
            rock.x = wrap(rock.x + rock.vx, 480);
            rock.y = wrap(rock.y + rock.vy, 440);
        });
        game.shots.forEach((shot) => {
            shot.x = wrap(shot.x + shot.vx, 480);
            shot.y = wrap(shot.y + shot.vy, 440);
            shot.life--;
            const index = game.rocks.findIndex((rock) => Math.hypot(rock.x - shot.x, rock.y - shot.y) < rock.radius);
            if (index < 0 || shot.life <= 0) return;
            const [rock] = game.rocks.splice(index, 1);
            shot.life = 0;
            game.score += rock.radius === 30 ? 20 : 50;
            if (rock.radius === 30) {
                for (const side of [-1, 1]) game.rocks.push({ ...rock, radius: 15,
                    vx: rock.vx + side * 1.2, vy: rock.vy - side * 0.9 });
            }
        });
        game.shots = game.shots.filter((shot) => shot.life > 0);
        if (!game.safe && game.rocks.some((rock) => Math.hypot(rock.x - ship.x, rock.y - ship.y) < rock.radius + 9)) {
            game.lives--;
            game.ended = game.lives === 0;
            Object.assign(ship, { x: 240, y: 220, vx: 0, vy: 0 });
            game.safe = 150;
        }
        if (!game.rocks.length) wave();
    };
    wave();
    return game;
}

export function createFrogger() {
    const game = {
        player: { x: 240, row: 10 }, score: 0, lives: 3,
        homes: [], started: false, ended: false, won: false,
        cooldown: 0, remaining: 1800,
        lanes: [
            { row: 2, speed: 0.7, width: 130, type: 'log', objects: [0, 210, 420] },
            { row: 3, speed: -0.9, width: 120, type: 'log', objects: [40, 240, 440] },
            { row: 4, speed: 0.6, width: 140, type: 'log', objects: [0, 220, 440] },
            { row: 6, speed: -1.1, width: 65, type: 'car', objects: [50, 280] },
            { row: 7, speed: 1.5, width: 50, type: 'car', objects: [0, 210, 420] },
            { row: 8, speed: -0.8, width: 85, type: 'car', objects: [100, 350] },
            { row: 9, speed: 1, width: 55, type: 'car', objects: [0, 240] },
        ],
    };
    function reset() { game.player = { x: 240, row: 10 }; game.remaining = 1800; }
    function lose() {
        game.lives--; game.ended = game.lives === 0; reset();
    }
    function check() {
        const { x, row } = game.player;
        if (x < 12 || x > 468) { lose(); return; }
        const lane = game.lanes.find((lane) => lane.row === row);
        if (lane) {
            const hit = lane.objects.some((left) => lane.type === 'log'
                ? x - 10 >= left && x + 10 <= left + lane.width
                : x + 11 > left && x - 11 < left + lane.width);
            if ((lane.type === 'car' && hit) || (lane.type === 'log' && !hit)) { lose(); return; }
        }
        if (row === 1) {
            const home = Math.round((x - 48) / 96);
            if (home < 0 || home > 4 || Math.abs(x - (48 + home * 96)) > 25 || game.homes.includes(home)) {
                lose(); return;
            }
            game.homes.push(home); game.score += 100;
            game.won = game.homes.length === 5; game.ended = game.won; reset();
        }
    }
    game.turn = (direction) => {
        if (game.ended || game.cooldown) return;
        const delta = { up: [0, -1], down: [0, 1], left: [-32, 0], right: [32, 0] }[direction];
        if (!delta) return;
        game.started = true;
        game.player.x += delta[0];
        game.player.row = Math.max(1, Math.min(10, game.player.row + delta[1]));
        game.cooldown = 8;
        check();
    };
    game.step = () => {
        if (!game.started || game.ended) return;
        game.cooldown = Math.max(0, game.cooldown - 1);
        if (--game.remaining <= 0) { lose(); return; }
        game.lanes.forEach((lane) => {
            lane.objects = lane.objects.map((x) => {
                const next = x + lane.speed;
                return next > 480 ? -lane.width : next < -lane.width ? 480 : next;
            });
            if (lane.type === 'log' && lane.row === game.player.row) game.player.x += lane.speed;
        });
        check();
    };
    return game;
}

export function renderAsteroids(context, game, time) {
    backdrop(context, 480, 440, '#292d59');
    // Fixed star positions avoid visual jitter and allocations in the frame loop.
    for (let i = 0; i < 85; i++) {
        context.fillStyle = i % 4 ? '#d4e8ff65' : '#ffffffcc';
        const size = i % 4 ? 1 : 2;
        context.fillRect((i * 137 + 21) % 480, (i * 89 + 7) % 440, size, size);
    }
    context.save();
    context.globalAlpha = 0.25;
    sphere(context, 420, 65, 42, '#8b85bf');
    context.restore();
    game.rocks.forEach((rock) => {
        context.save();
        context.translate(rock.x, rock.y);
        context.rotate((rock.x + rock.y) * 0.008);
        context.fillStyle = gradient(context, -rock.radius, -rock.radius, rock.radius * 2, rock.radius * 2, '#b4c2d2');
        context.strokeStyle = '#d2e3ee80';
        context.lineWidth = 1;
        context.shadowColor = '#00000090';
        context.shadowBlur = 8;
        context.shadowOffsetY = 5;
        context.beginPath();
        for (let i = 0; i < 10; i++) {
            const angle = i * Math.PI * 2 / 9;
            const radius = rock.radius * (i % 2 ? 0.85 : 1);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
        }
        context.closePath();
        context.fill();
        context.stroke();
        context.shadowColor = 'transparent';
        for (let i = 0; i < 3; i++) {
            const x = (i - 1) * rock.radius * 0.4;
            const y = (i % 2 ? 0.35 : -0.25) * rock.radius;
            context.beginPath();
            context.ellipse(x, y, rock.radius * 0.18, rock.radius * 0.12, -0.5, 0, Math.PI * 2);
            context.fillStyle = '#17203170';
            context.fill();
            context.strokeStyle = '#ffffff35';
            context.stroke();
        }
        context.restore();
    });
    context.save();
    context.strokeStyle = '#ffe4a0';
    context.shadowColor = '#ffb94f';
    context.shadowBlur = 9;
    context.lineWidth = 3;
    game.shots.forEach((shot) => {
        context.beginPath();
        context.moveTo(shot.x - shot.vx * 1.4, shot.y - shot.vy * 1.4);
        context.lineTo(shot.x, shot.y);
        context.stroke();
    });
    context.restore();
    if (game.safe && Math.floor(time / 100) % 2) return;
    context.save();
    context.translate(game.ship.x, game.ship.y);
    context.rotate(game.ship.angle);
    if (game.up) {
        context.fillStyle = '#ff9659';
        context.shadowColor = '#ff794a';
        context.shadowBlur = 12;
        context.beginPath();
        context.moveTo(-8, -5);
        context.lineTo(-23, 0);
        context.lineTo(-8, 5);
        context.fill();
        context.fillStyle = '#fff2c8';
        context.fillRect(-17, -2, 10, 4);
    }
    context.shadowColor = '#00000080';
    context.shadowBlur = 5;
    context.shadowOffsetY = 3;
    context.fillStyle = gradient(context, -10, -10, 10, 22, '#e6f4ff');
    context.strokeStyle = '#91b8cf';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(15, 0);
    context.lineTo(-11, -10);
    context.lineTo(-6, 0);
    context.lineTo(-11, 10);
    context.closePath();
    context.fill();
    context.stroke();
    context.shadowColor = 'transparent';
    context.fillStyle = '#274d70';
    context.beginPath();
    context.ellipse(2, 0, 5, 3, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#c7f36a';
    context.beginPath();
    context.moveTo(-6, 0);
    context.lineTo(13, 0);
    context.stroke();
    context.restore();
}

function drawFrog(context, x, y) {
    context.save();
    context.fillStyle = '#00000045';
    context.beginPath();
    context.ellipse(x + 2, y + 9, 16, 7, 0, 0, Math.PI * 2);
    context.fill();
    raised(context, x - 16, y - 3, 8, 17, 4, '#80bb45');
    raised(context, x + 8, y - 3, 8, 17, 4, '#80bb45');
    sphere(context, x, y + 1, 12, '#a9e967');
    sphere(context, x - 7, y - 8, 5, '#b9ed7a');
    sphere(context, x + 7, y - 8, 5, '#b9ed7a');
    context.fillStyle = '#14291e';
    context.beginPath();
    context.arc(x - 7, y - 9, 2, 0, Math.PI * 2);
    context.arc(x + 7, y - 9, 2, 0, Math.PI * 2);
    context.fill();
    context.restore();
}

function drawLog(context, x, y, width) {
    raised(context, x, y, width, 28, 12, '#c79961');
    context.strokeStyle = '#62412c80';
    context.lineWidth = 1;
    for (let line = 0; line < 3; line++) {
        context.beginPath();
        context.moveTo(x + 13, y + 8 + line * 6);
        context.bezierCurveTo(x + width * 0.3, y + 2 + line * 6,
            x + width * 0.6, y + 15 + line * 5, x + width - 10, y + 7 + line * 6);
        context.stroke();
    }
    context.fillStyle = '#e0bd87';
    context.beginPath();
    context.ellipse(x + width - 7, y + 14, 5, 10, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#84603a';
    context.stroke();
}

function drawCar(context, x, y, width, color, speed) {
    context.fillStyle = '#0c101a';
    context.fillRect(x + 9, y - 2, 11, 32);
    context.fillRect(x + width - 20, y - 2, 11, 32);
    raised(context, x, y, width, 28, 7, color);
    raised(context, x + width * 0.28, y + 3, width * 0.42, 22, 4, color);
    context.fillStyle = '#b2daec';
    context.fillRect(x + width * 0.32, y + 5, 6, 18);
    context.fillStyle = '#2b4e65';
    context.fillRect(x + width * 0.6, y + 5, 5, 18);
    context.fillStyle = '#fff2bb';
    const front = speed > 0 ? x + width - 4 : x + 1;
    context.fillRect(front, y + 4, 3, 5);
    context.fillRect(front, y + 19, 3, 5);
    context.fillStyle = '#ff6b6b';
    const rear = speed > 0 ? x + 1 : x + width - 4;
    context.fillRect(rear, y + 4, 3, 5);
    context.fillRect(rear, y + 19, 3, 5);
}

export function renderFrogger(context, game) {
    backdrop(context, 480, 440, '#426c48');
    context.fillStyle = gradient(context, 0, 80, 0, 120, '#408f9d');
    context.fillRect(0, 80, 480, 120);
    context.strokeStyle = '#c1f3ed30';
    context.lineWidth = 1;
    for (let i = 0; i < 34; i++) {
        const x = (i * 71 + (1800 - game.remaining) * 0.25) % 480;
        const y = 87 + i * 17 % 107;
        context.beginPath();
        context.moveTo(x, y);
        context.quadraticCurveTo(x + 8, y - 3, x + 20, y);
        context.stroke();
    }
    context.fillStyle = '#ffffff0e';
    for (let i = 0; i < 95; i++) {
        const y = i % 2 ? 207 + i % 22 : 405 + i % 25;
        context.fillRect(i * 61 % 480, y, 2, 4);
    }
    context.fillStyle = gradient(context, 0, 240, 0, 160, '#444b5a');
    context.fillRect(0, 240, 480, 160);
    for (const y of [78, 200, 238, 400]) {
        raised(context, 0, y, 480, 4, 0, '#89967f');
    }
    context.strokeStyle = '#e1e8e850';
    context.setLineDash([16, 14]);
    for (let y = 280; y < 400; y += 40) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(480, y);
        context.stroke();
    }
    context.setLineDash([]);
    game.lanes.forEach((lane) => lane.objects.forEach((x) => {
        const y = lane.row * 40 + 6;
        if (lane.type === 'log') drawLog(context, x, y, lane.width);
        else drawCar(context, x, y, lane.width,
            ['#f1abc2', '#f6d965', '#a8ccef'][lane.row % 3], lane.speed);
    }));
    for (let i = 0; i < 5; i++) {
        raised(context, 26 + i * 96, 42, 44, 34, 12, '#173d31');
        context.strokeStyle = '#9eca7560';
        context.lineWidth = 2;
        context.beginPath();
        context.ellipse(48 + i * 96, 60, 15, 10, 0, 0.3, Math.PI * 2);
        context.stroke();
        if (game.homes.includes(i)) drawFrog(context, 48 + i * 96, 58);
    }
    drawFrog(context, game.player.x, game.player.row * 40 + 20);
}
