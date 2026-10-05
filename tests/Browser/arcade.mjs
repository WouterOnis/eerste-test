// Run with PLAYWRIGHT_MODULE pointing to an installed playwright/index.mjs.
// Browser binaries and dependencies can remain outside the project.
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true });
try {
    for (const mobile of [false, true]) {
        const context = await browser.newContext({
            viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 1000 },
            hasTouch: mobile, isMobile: mobile, reducedMotion: mobile ? 'reduce' : 'no-preference',
        });
        const page = await context.newPage(), errors = [];
        page.on('pageerror', error => errors.push(error.message));
        // Expose state only in intercepted test responses, never in the deployed app.
        await page.route('**/js/arcade.js*', async route => {
            const response = await route.fetch();
            await route.fulfill({ response, body: (await response.text()).replace('const game = new Game();', 'const game = window.testGame = new Game();') });
        });
        await page.goto(process.env.ARCADE_URL || 'http://127.0.0.1:8080/');
        await page.locator('#start').click();
        await page.keyboard.press('Space');
        assert.ok(await page.evaluate(() => testGame.shots.length > 0));
        await page.keyboard.down('ArrowLeft');
        await page.waitForTimeout(100);
        await page.keyboard.up('ArrowLeft');
        assert.ok(await page.evaluate(() => testGame.ship.x < 500));
        await page.locator('#pause').click();
        assert.equal(await page.evaluate(() => testGame.running), false);
        await page.locator('#start').click();
        if (mobile) {
            const canvas = page.locator('#game'), box = await canvas.boundingBox();
            await canvas.dispatchEvent('pointermove', { clientX: box.x + box.width * .7, clientY: box.y + box.height * .8, pointerId: 7, pointerType: 'touch' });
            assert.ok(await page.evaluate(() => testGame.ship.x > 650));
            await page.locator('#fire').tap();
        }
        // Resolve all 24 hits through real collision detection and the actual frame loop.
        await page.evaluate(() => {
            testGame.spawn = 100;
            testGame.shots = testGame.aliens().map(alien => ({ x: alien.x, y: alien.y + 20 }));
        });
        await page.waitForFunction(() => testGame.levelComplete);
        assert.equal(await page.locator('#overlay-title').textContent(), 'LEVEL UP!');
        assert.equal(await page.locator('#cleared').textContent(), '24 / 24');
        assert.equal(await page.locator('#start').textContent(), 'Start golf 2 ↗');
        const complete = await page.evaluate(() => ({ score: testGame.score, lives: testGame.lives, time: testGame.time }));
        await page.waitForTimeout(400);
        assert.deepEqual(await page.evaluate(() => ({ score: testGame.score, lives: testGame.lives, time: testGame.time })), complete);
        assert.ok(complete.score >= 2400);
        assert.equal(await page.evaluate(() => document.activeElement.id), 'start');
        await page.screenshot({ path: '/tmp/arcade-level-' + (mobile ? 'mobile' : 'desktop') + '.png', fullPage: true });
        await page.locator('#start').click();
        assert.deepEqual(await page.evaluate(() => [testGame.wave, testGame.aliens().length, testGame.lives, testGame.levelComplete]), [2, 24, complete.lives, false]);
        await page.screenshot({ path: '/tmp/arcade-playing-' + (mobile ? 'mobile' : 'desktop') + '.png', fullPage: true });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await page.evaluate(() => {
            testGame.lives = 1; testGame.shield = 0;
            testGame.bullets = [{ x: testGame.ship.x, y: testGame.ship.y, vx: 0, vy: 100, radius: 8 }];
        });
        await page.waitForFunction(() => testGame.over);
        assert.equal(await page.locator('#overlay-title').textContent(), 'GAME OVER');
        await page.locator('#start').click();
        assert.deepEqual(await page.evaluate(() => [testGame.wave, testGame.lives, testGame.destroyed.size]), [1, 3, 0]);
        assert.deepEqual(errors, []);
        console.log((mobile ? 'Mobile / reduced motion' : 'Desktop') + ': controls, pause, 24 hits, level up, continuation and restart passed');
        await context.close();
    }
} finally { await browser.close(); }
