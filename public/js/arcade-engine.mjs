export const WIDTH = 1000;
export const HEIGHT = 650;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export class Game {
    constructor(random = Math.random) { this.random = random; this.reset(); }
    reset() {
        this.ship = { x: 500, y: 560 };
        this.bullets = [];
        this.shots = [];
        this.destroyed = new Set();
        this.bonus = 0;
        this.wave = 1;
        this.cooldown = 0;
        this.time = 0;
        this.score = 0;
        this.lives = 3;
        this.shield = 0;
        this.spawn = 0.6;
        this.running = false;
        this.over = false;
    }
    aliens() {
        const offset = Math.sin(Math.floor(this.time * 3) / 8) * 80;
        return Array.from({ length: 24 }, (_, i) => ({ id: i, x: 140 + (i % 8) * 100 + offset, y: 75 + Math.floor(i / 8) * 52, row: Math.floor(i / 8) })).filter(alien => !this.destroyed.has(alien.id));
    }
    fire() {
        if (!this.running || this.over || this.cooldown > 0) return false;
        this.shots.push({ x: this.ship.x, y: this.ship.y - 24 });
        this.cooldown = .2;
        return true;
    }
    move(x, y) { this.ship.x = clamp(x, 24, WIDTH - 24); this.ship.y = clamp(y, 270, HEIGHT - 35); }
    update(dt) {
        if (!this.running || this.over) return;
        dt = clamp(dt, 0, 0.05);
        this.time += dt;
        this.cooldown = Math.max(0, this.cooldown - dt);
        for (const shot of this.shots) {
            const oldY = shot.y;
            shot.y -= 700 * dt;
            // Bottom-most target is hit first, including between frames.
            const target = this.aliens().sort((a, b) => b.y - a.y).find(alien => Math.abs(shot.x - alien.x) <= 24 && shot.y - 8 <= alien.y + 16 && oldY + 8 >= alien.y - 16);
            if (target) {
                this.destroyed.add(target.id);
                this.bonus += 100;
                shot.hit = true;
            }
        }
        this.shots = this.shots.filter(shot => !shot.hit && shot.y > -20);
        if (this.destroyed.size === 24) {
            this.wave++;
            this.destroyed.clear();
            this.shots = [];
            this.bullets = [];
            this.spawn = 1;
        }
        this.score = Math.floor(this.time * 10) + this.bonus;
        this.shield = Math.max(0, this.shield - dt);
        this.spawn -= dt;
        if (this.spawn <= 0) {
            const aliens = this.aliens();
            const alien = aliens[Math.floor(this.random() * aliens.length)];
            const aimed = this.random() < 0.5;
            this.bullets.push({ x: alien.x, y: alien.y + 20, vx: aimed ? clamp((this.ship.x - alien.x) * .28, -90, 90) : 0, vy: 155 + Math.min(180, this.time * 2), radius: 8 });
            this.spawn = Math.max(.18, .65 - this.time * .006);
        }
        for (const bullet of this.bullets) {
            const oldX = bullet.x, oldY = bullet.y;
            bullet.x += bullet.vx * dt;
            bullet.y += bullet.vy * dt;
            // Swept collision keeps fast projectiles from skipping the ship.
            const dx = bullet.x - oldX, dy = bullet.y - oldY;
            const t = clamp(((this.ship.x - oldX) * dx + (this.ship.y - oldY) * dy) / (dx * dx + dy * dy || 1), 0, 1);
            if (!this.shield && Math.hypot(oldX + dx * t - this.ship.x, oldY + dy * t - this.ship.y) < 19 + bullet.radius) {
                bullet.hit = true;
                this.lives--;
                this.shield = 1.6;
                if (this.lives === 0) { this.over = true; this.running = false; break; }
            }
        }
        this.bullets = this.bullets.filter(b => !b.hit && b.y < HEIGHT + 20 && b.x > -20 && b.x < WIDTH + 20);
    }
}
