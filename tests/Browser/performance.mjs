// Run with the same external Playwright setup as arcade.mjs.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true });
try {
 for (const mobile of [false, true]) {
  const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 1000 }, deviceScaleFactor: mobile ? 2 : 1 });
  await page.route('**/js/arcade.js*', async route => {
   const response = await route.fetch();
   let body = process.env.ARCADE_SCRIPT ? readFileSync(process.env.ARCADE_SCRIPT, 'utf8') : await response.text();
   body = body.replace('function draw() {', 'function measuredDraw() {');
   body += '\nfunction draw() { const start = performance.now(); measuredDraw(); window.drawTimes.push(performance.now() - start); }';
   await route.fulfill({ response, body: 'window.drawTimes = [];\n' + body });
  });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const cdp = await page.context().newCDPSession(page); await cdp.send('Performance.enable');
  const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  await page.goto(process.env.ARCADE_URL || 'http://127.0.0.1:8080/');
  await page.waitForTimeout(1000);
  const initial = await page.evaluate(() => ({ draws: drawTimes.length, firstDrawMs: drawTimes[0], paints: performance.getEntriesByType('paint').map(p => [p.name, p.startTime]), assets: performance.getEntriesByType('resource').map(r => ({ name: new URL(r.name).pathname, bytes: r.transferSize, ms: r.duration })) }));
  const before = await metrics(); const count = await page.evaluate(() => drawTimes.length);
  await page.waitForTimeout(2000);
  const after = await metrics();
  const idleDraws = await page.evaluate(n => drawTimes.length - n, count);
  await page.locator('#start').click(); const playBefore = await metrics(); await page.waitForTimeout(2000); const playAfter = await metrics();
  const playing = await page.evaluate(() => { const a = drawTimes.slice(-60).sort((a,b) => a-b); return { medianDrawMs: a[Math.floor(a.length/2)], p95DrawMs: a[Math.floor(a.length*.95)] }; });
  await page.locator('#pause').click(); await page.waitForTimeout(100);
  const paused = await page.evaluate(() => drawTimes.length); await page.waitForTimeout(500);
  if (process.env.ASSERT_IDLE) { assert.equal(idleDraws, 0); assert.equal(await page.evaluate(() => drawTimes.length), paused); }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ mobile, initial, idleDraws, idleTaskMs: (after.TaskDuration-before.TaskDuration)*1000, playingTaskMs: (playAfter.TaskDuration-playBefore.TaskDuration)*1000, playing }));
  await page.close();
 }
} finally { await browser.close(); }
