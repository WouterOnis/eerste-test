# Arcade performance investigation — 2026-10-05

Measured against the local Laravel `/` route with headless Chromium, desktop
1280×1000 at DPR 1 and mobile viewport 390×844 at DPR 2. These are local
runtime measurements, not production or physical-phone measurements.

| Measurement | Desktop before / after | Mobile before / after |
| --- | --- | --- |
| Draw calls in first second | 63 / 1 | 63 / 1 |
| Idle draws over next 2 seconds | 121 / 0 | 121 / 0 |
| Browser TaskDuration over idle 2 seconds | 944 / 0.52 ms | 888 / 0.52 ms |
| Browser TaskDuration over playing 2 seconds | 933 / 387 ms | 910 / 486 ms |
| First contentful paint, sample | 44 / 28 ms | 44 / 36 ms |

First-paint samples vary; the major improvement is eliminating sustained work
immediately after opening the page. JavaScript draw submission itself was short
(roughly 0.2 ms median) and does not capture deferred canvas rendering costs.
Creating the sprite cache takes a few milliseconds once instead of repeatedly
rasterizing roughly 1,400 glowing sprite pixels per frame.

The original unconditional requestAnimationFrame loop repainted an unchanged
start screen about 60 times per second. Every frame recomputed per-pixel shadows,
the nebula gradient and sprite poses. Initial loading involved three local assets
of roughly 27 kB total, with no external image/font requests. No repeated listener
registration or interval timers were found. Game objects and effects already had
removal paths; no accumulating leak was demonstrated as the cause.

Changes: schedule frames only during play or finishing feedback; reuse at most
eight cached sprite variants and one background canvas; replace caches on size
changes; construct poses once; update the HUD only when displayed state changes.
Gameplay engine and input handlers remain intact.

Validation: 11 JavaScript tests, 2 Laravel tests, desktop and mobile browser flows
including controls, all 24 collisions, level-up, score/lives preservation, game
over/restart, four additional waves, effect cleanup, bounded cache, blur/pause,
resize and rapid resume without duplicate animation callbacks. Idle and paused
screens perform no ongoing drawing. Visual screenshots checked as well.

Reproduce with an external Playwright installation and browser dependencies:

```sh
node --test tests/JavaScript/*.test.mjs
php artisan test
# Set PLAYWRIGHT_MODULE, PLAYWRIGHT_BROWSERS_PATH and any required library/font paths.
node tests/Browser/arcade.mjs
ASSERT_IDLE=1 node tests/Browser/performance.mjs
```

Both browser scripts default to http://127.0.0.1:8080/; override with ARCADE_URL.
The performance script optionally takes ARCADE_SCRIPT pointing to a saved baseline
JavaScript file, intercepted only in test responses. Omit ASSERT_IDLE for baseline.
No production deployment or data migration was performed. Existing localStorage
best-score storage remains a known deviation from the database storage standard.
