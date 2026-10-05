import { Game, WIDTH, HEIGHT } from './arcade-engine.mjs';
const $ = id => document.getElementById(id);
const canvas = $('game'), ctx = canvas.getContext('2d');
const game = new Game();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const keys = new Set();
const firingPointers = new Set();
let best = 0, previous = 0;
let effects = [], damageGlow = 0;
let framePending = false, hudState = "";
const spriteCache = new Map();
let backdrop;
const colors = ['#bda0ff', '#91bcff', '#b5ff66'];
try { best = Math.max(0, Number(localStorage.getItem('wonis-arcade-best')) || 0); } catch {}
const stars = Array.from({ length: 100 }, () => ({ x: Math.random() * WIDTH, y: Math.random() * HEIGHT, size: Math.random() > .85 ? 2 : 1 }));
const sprites = [
    ['00100000100','00010001000','00111111100','01101110110','11111111111','10111111101','10100000101','00011011000'],
    ['00011111000','01111111110','11111111111','11001110011','11111111111','00011011000','00110101100','11000000011'],
    ['00001110000','00111111100','01111111110','11011011011','11111111111','00100100100','01011011010','10100000101']
];
const ship = ['00000100000','00001110000','00001110000','01011111010','11111111111','11111111111','11001110011','00001010000'];
// Cache the exact pixel artwork and per-pixel glow at the current backing resolution.
// Eight variants maximum (two poses per alien and two ship colours); resize replaces them.
const alienPoses = sprites.map(pattern => [pattern, [...pattern.slice(0, 6), pattern[7], pattern[6]]]);
function surface(width, height) {
    const image = document.createElement('canvas');
    image.width = width; image.height = height;
    return image;
}
function sprite(pattern, x, y, color, pixel = 4) {
    const key = color + pattern.join('');
    let image = spriteCache.get(key);
    const sx = canvas.width / WIDTH, sy = canvas.height / HEIGHT;
    // Shadow blur uses backing pixels, so keep padding independent of display size.
    const originX = 22 + 32 / sx, originY = 16 + 32 / sy;
    if (!image) {
        image = surface(Math.ceil(44 * sx) + 64, Math.ceil(32 * sy) + 64);
        const paint = image.getContext('2d');
        paint.setTransform(sx, 0, 0, sy, 0, 0);
        paint.shadowColor = color; paint.shadowBlur = 12; paint.fillStyle = color;
        pattern.forEach((row, iy) => [...row].forEach((cell, ix) => {
            if (cell === '1') paint.fillRect(originX + (ix - row.length / 2) * pixel, originY + (iy - pattern.length / 2) * pixel, pixel, pixel);
        }));
        spriteCache.set(key, image);
    }
    ctx.drawImage(image, Math.round(x) - originX, Math.round(y) - originY, image.width / sx, image.height / sy);
}
function cacheBackdrop() {
    backdrop = surface(canvas.width, canvas.height);
    const paint = backdrop.getContext('2d');
    paint.setTransform(canvas.width / WIDTH, 0, 0, canvas.height / HEIGHT, 0, 0);
    paint.fillStyle = '#090d19'; paint.fillRect(0, 0, WIDTH, HEIGHT);
    const nebula = paint.createRadialGradient(750, 180, 0, 650, 220, 620);
    nebula.addColorStop(0, '#32265888'); nebula.addColorStop(.5, '#12344044'); nebula.addColorStop(1, '#090d1900');
    paint.fillStyle = nebula; paint.fillRect(0, 0, WIDTH, HEIGHT);
    paint.strokeStyle = '#bda0ff18'; paint.lineWidth = 2;
    paint.beginPath(); paint.arc(850, 100, 190, 0, Math.PI * 2); paint.stroke();
}
function hud() {
    const state = [game.destroyed.size, game.levelComplete, game.wave, game.score, best, game.lives].join(':');
    if (state === hudState) return;
    hudState = state;
    $('progress').value = game.destroyed.size;
    $('cleared').textContent = `${game.destroyed.size} / 24`;
    $('formation').textContent = game.levelComplete ? 'FORMATIE VERSLAGEN' : `FORMATIE · ${24 - game.destroyed.size} BEESTJES`;
    $('wave').textContent = `GOLF ${String(game.wave).padStart(2, '0')}`;
    $('score').textContent = String(game.score).padStart(5, '0');
    $('best').textContent = String(Math.max(best, game.score)).padStart(5, '0');
    $('lives').textContent = Array.from({ length: 3 }, (_, i) => i < game.lives ? '♥' : '♡').join(' ');
    $('lives').setAttribute('aria-label', `${game.lives} levens`);
}
function draw() {
    const sx = canvas.width / WIDTH, sy = canvas.height / HEIGHT;
    ctx.setTransform(sx, 0, 0, sy, 0, 0);
    ctx.drawImage(backdrop, 0, 0, WIDTH, HEIGHT);
    for (const star of stars) {
        ctx.fillStyle = star.size === 2 ? '#687c94' : '#344459';
        ctx.fillRect(star.x, (star.y + (reduced.matches ? 0 : game.time * star.size * 5)) % HEIGHT, star.size, star.size);
    }
    ctx.strokeStyle = '#263b4638'; ctx.lineWidth = 1;
    for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(WIDTH / 2 + i * 40, 400); ctx.lineTo(WIDTH / 2 + i * 170, HEIGHT); ctx.stroke(); }
    for (let y = 430; y < HEIGHT; y += 45) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }
    for (const alien of game.aliens()) {
        const pattern = alienPoses[alien.row][Math.floor(game.time * 3) % 2];
        sprite(pattern, alien.x, alien.y, colors[alien.row]);
    }
    for (const bullet of game.bullets) {
        ctx.fillStyle = '#ef88ba33'; ctx.fillRect(bullet.x - 3, bullet.y - 25, 6, 24);
        ctx.fillStyle = '#ff94c6'; ctx.fillRect(bullet.x - 4, bullet.y - 9, 8, 18);
        ctx.fillStyle = '#ffe1f0'; ctx.fillRect(bullet.x - 2, bullet.y - 5, 4, 9);
    }
    for (const shot of game.shots) {
        ctx.fillStyle = '#b5ff6633'; ctx.fillRect(shot.x - 5, shot.y, 10, 26);
        ctx.fillStyle = '#b5ff66'; ctx.fillRect(shot.x - 3, shot.y - 8, 6, 18);
        ctx.fillStyle = '#fff'; ctx.fillRect(shot.x - 1, shot.y - 8, 2, 12);
    }
    for (const effect of effects) {
        ctx.globalAlpha = Math.min(1, effect.life * 2);
        ctx.fillStyle = effect.color;
        if (effect.text) {
            ctx.font = 'bold 18px ui-monospace, monospace';
            ctx.textAlign = 'center'; ctx.fillText(effect.text, effect.x, effect.y);
        } else {
            ctx.shadowColor = effect.color; ctx.shadowBlur = 8;
            ctx.fillRect(effect.x, effect.y, effect.size, effect.size);
        }
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    if (damageGlow > 0) {
        ctx.strokeStyle = `rgba(255, 110, 160, ${damageGlow})`;
        ctx.lineWidth = 12; ctx.strokeRect(6, 6, WIDTH - 12, HEIGHT - 12);
    }
    ctx.lineWidth = 1;
    if (game.lives) {
        if (game.shield) { ctx.strokeStyle = '#b5ff66'; ctx.beginPath(); ctx.arc(game.ship.x, game.ship.y, 32, 0, Math.PI * 2); ctx.stroke(); }
        sprite(ship, game.ship.x, game.ship.y, game.shield ? '#fff' : '#b5ff66');
        ctx.fillStyle = '#bda0ff'; ctx.fillRect(game.ship.x - 5, game.ship.y + 17, 10, reduced.matches ? 8 : 8 + Math.sin(game.time * 20) * 4);
    }
}
function feedback(event) {
    if (event.type === 'complete') return;
    const color = event.type === 'damage' ? '#ff94c6' : colors[event.row];
    if (event.type === 'damage') damageGlow = .7;
    effects.push({ x: event.x, y: event.y - 22, vx: 0, vy: reduced.matches ? 0 : -32, life: .9, color, text: event.type === 'hit' ? '+100' : 'GERAAKT' });
    if (reduced.matches) return;
    for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2, speed = 35 + Math.random() * 130;
        effects.push({ x: event.x, y: event.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .35 + Math.random() * .4, size: 2 + Math.random() * 4, color });
    }
}
function levelUp() {
    keys.clear(); firingPointers.clear();
    $('fire').disabled = true; $('pause').disabled = true;
    showOverlay('ALLE 24 BEESTJES VERSLAGEN', 'LEVEL UP!', `Golf ${game.wave} voltooid · ${game.score} punten · ${game.lives} levens over. Klaar voor de volgende formatie?`, `Start golf ${game.wave + 1} ↗`);
    $('overlay').setAttribute('data-mode', 'level');
    $('level-badge').hidden = false;
    $('state').textContent = `Level up! Golf ${game.wave} voltooid. Start golf ${game.wave + 1} wanneer je klaar bent.`;
    $('start').focus({ preventScroll: true });
}
function resize() {
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr)), height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width === width && canvas.height === height && backdrop) return;
    canvas.width = width; canvas.height = height;
    spriteCache.clear(); cacheBackdrop(); draw();
}
function showOverlay(label, title, copy, button) {
    $('overlay').setAttribute('data-mode', 'default');
    $('level-badge').hidden = true;
    $('overlay-label').textContent = label;
    $('overlay-title').textContent = title;
    $('overlay-copy').textContent = copy;
    $('start').textContent = button;
    $('overlay').hidden = false;
}
function pause() {
    if (!game.running) return;
    game.running = false; keys.clear(); firingPointers.clear();
    $('fire').disabled = true;
    showOverlay('MISSIE GEPAUZEERD', 'EVEN OP ADEM', 'Je score blijft behouden. Klaar om verder te vliegen?', 'Verder spelen ↗');
    $('pause').disabled = true;
    $('state').textContent = 'Gepauzeerd';
}
function end() {
    keys.clear(); firingPointers.clear(); $('fire').disabled = true;
    best = Math.max(best, game.score);
    try { localStorage.setItem('wonis-arcade-best', String(best)); } catch {}
    showOverlay('MISSIE VOLTOOID', 'GAME OVER', `Je overleefde ${Math.floor(game.time)} seconden en behaalde ${game.score} punten. Nog een poging?`, 'Opnieuw spelen ↗');
    $('pause').disabled = true;
    $('state').textContent = `Game over · ${game.score} punten`;
    $('start').focus();
}
$('start').addEventListener('click', () => {
    if (game.levelComplete) game.nextWave();
    else if (game.over || game.time === 0) game.reset();
    effects = []; damageGlow = 0;
    keys.clear(); firingPointers.clear();
    game.running = true; previous = performance.now();
    $('overlay').hidden = true; $('pause').disabled = false;
    $('fire').disabled = false;
    $('state').textContent = 'Missie actief · ontwijk en schiet terug';
    canvas.focus(); hud(); scheduleFrame();
});
$('pause').addEventListener('click', () => { pause(); $('start').focus(); });
function steer(event) {
    if (!game.running) return;
    const rect = canvas.getBoundingClientRect();
    game.move((event.clientX - rect.left) / rect.width * WIDTH, (event.clientY - rect.top) / rect.height * HEIGHT);
}
canvas.addEventListener('pointermove', steer);
canvas.addEventListener('pointerenter', () => {
    if (game.running) canvas.focus({ preventScroll: true });
});
canvas.addEventListener('pointerdown', event => {
    if (game.running && event.button === 0) {
        canvas.focus({ preventScroll: true });
        canvas.setPointerCapture(event.pointerId); steer(event);
        firingPointers.add(event.pointerId); game.fire();
    }
});
$('fire').addEventListener('pointerdown', event => {
    if (!game.running || event.button !== 0) return;
    event.preventDefault();
    $('fire').setPointerCapture(event.pointerId);
    firingPointers.add(event.pointerId); game.fire();
});
$('fire').addEventListener('click', () => game.fire());
for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    window.addEventListener(eventName, event => firingPointers.delete(event.pointerId));
}
canvas.addEventListener('pointercancel', pause);
window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && game.running) { event.preventDefault(); pause(); $('start').focus(); }
    const isSpace = event.code === 'Space' || event.key === ' ';
    if (game.running && isSpace) {
        event.preventDefault();
        keys.add(' ');
        game.fire();
        return;
    }
    if (game.running && [canvas, $('fire')].includes(document.activeElement) && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault(); keys.add(event.key);
    }
});
window.addEventListener('keyup', event => {
    keys.delete(event.code === 'Space' ? ' ' : event.key);
});
window.addEventListener('blur', pause);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
window.addEventListener('resize', resize);
function motionNote() { $('motion-note').textContent = reduced.matches ? 'Rustige weergave: decor staat stil. Tijdens het spelen bewegen aliens en projectielen.' : 'Sturen: muis / pijltjes · Vuren: spatie / klik / VUUR (vasthouden kan)'; }
reduced.addEventListener('change', () => { motionNote(); draw(); });
function scheduleFrame() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(frame);
}
function frame(now) {
    framePending = false;
    // Pause freezes effects too. Completed waves finish their brief feedback, then sleep.
    if (!game.running && !((game.levelComplete || game.over) && (effects.length || damageGlow > 0))) return;
    const dt = Math.min((now - previous) / 1000, .05); previous = now;
    if (game.running) {
        if (keys.size) game.move(game.ship.x + ((keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0)) * dt * 500, game.ship.y + ((keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0)) * dt * 420);
        const lives = game.lives;
        game.update(dt);
        game.events.forEach(feedback);
        if (keys.has(' ') || firingPointers.size) game.fire();
        hud();
        if (game.over) end();
        else if (game.levelComplete) levelUp();
        else if (game.lives < lives) $('state').textContent = `Geraakt · ${game.lives} levens · schild tijdelijk actief`;
    }
    if (game.running || game.levelComplete || game.over) {
        for (const effect of effects) { effect.life -= dt; effect.x += effect.vx * dt; effect.y += effect.vy * dt; }
        effects = effects.filter(effect => effect.life > 0);
        damageGlow = Math.max(0, damageGlow - dt * 1.5);
    }
    draw();
    if (game.running || effects.length || damageGlow > 0) scheduleFrame();
}
hud(); motionNote(); resize();
