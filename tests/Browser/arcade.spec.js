import { test, expect } from "@playwright/test";

const ids = [
    "pacman",
    "asteroids",
    "frogger",
    "tetris",
    "invaders",
    "snake",
    "pong",
    "2048",
    "breakout",
    "memory",
    "reaction",
];

const pageErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
    const errors = [];
    pageErrors.set(page, errors);
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
});
test.afterEach(async ({ page }) => {
    expect(pageErrors.get(page)).toEqual([]);
});

test("collection navigation, search, reset and favorites work", async ({
    page,
}) => {
    await expect(page.locator(".game-card:visible")).toHaveCount(11);
    await expect(page.locator(".new-stamp")).toHaveCount(6);
    await page.locator("#game-search").fill("space");
    await expect(page.locator(".game-card:visible")).toHaveCount(1);
    await page.locator("#game-search").fill("niet gevonden");
    await expect(page.locator("#empty-state")).toBeVisible();
    await page.locator("#reset-filters").click();
    await expect(page.locator(".game-card:visible")).toHaveCount(11);
    await page.locator('[data-favorite="pong"]').click();
    await page.locator('[data-view="favorites"]').click();
    await expect(page.locator(".game-card:visible")).toHaveCount(1);
    await expect(page.locator('[data-view="favorites"]')).toHaveAttribute(
        "aria-pressed",
        "true",
    );
    await page.locator('[data-favorite="pong"]').click();
    await expect(page.locator("#empty-state")).toBeVisible();
    await page.locator("#reset-filters").click();
    await page.locator('.filter[data-category="puzzle"]').click();
    await expect(page.locator(".game-card:visible")).toHaveCount(3);
    await page.locator('.filter[data-category="arcade"]').click();
    await expect(page.locator(".game-card:visible")).toHaveCount(7);
    await page.locator('.filter[data-category="reflex"]').click();
    await expect(page.locator(".game-card:visible")).toHaveCount(1);
});

test("all eleven games open and restart, animated games pause", async ({
    page,
}) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const id of ids) {
        await page.locator(`[data-play="${id}"]`).click();
        await expect(page.locator("#game-dialog")).toBeVisible();
        if (!["memory", "reaction", "2048"].includes(id)) {
            await expect(page.locator("#game-stage canvas")).toBeVisible();
            await page.locator("#pause-game").click();
            await expect(page.locator(".canvas-overlay")).toHaveText(
                "Even pauze.",
            );
            await page.locator("#pause-game").click();
        }
        await page.locator("#restart-game").click();
        if (["pong", "breakout", "invaders", "asteroids", "tetris"].includes(id))
            await page.locator("#action-game").click();
        if (!["memory", "reaction"].includes(id)) {
            const direction = id === "pong" ? "down" : "left";
            await page.locator(`[data-direction="${direction}"]`).click();
        }
        await page.locator("#close-game").click();
        await expect(page.locator("#game-dialog")).not.toBeVisible();
    }
    await page.locator('[data-view="recent"]').click();
    await expect(page.locator(".game-card:visible")).toHaveCount(11);
    expect(errors).toEqual([]);
});

test("Tetris keyboard drops and 2048 moves/reset/swipe", async ({ page }) => {
    await page.locator('[data-play="tetris"]').click();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Space");
    await expect(page.locator("#game-stat")).toContainText(/Score: [1-9]/);
    await page.locator("#close-game").click();
    await page.locator('[data-play="2048"]').click();
    await expect(page.locator('.tile-2048:not([data-value="0"])')).toHaveCount(
        2,
    );
    for (const key of ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"])
        await page.keyboard.press(key);
    expect(
        await page.locator('.tile-2048:not([data-value="0"])').count(),
    ).toBeGreaterThan(2);
    await page.locator("#restart-game").click();
    await expect(page.locator('.tile-2048:not([data-value="0"])')).toHaveCount(
        2,
    );
    const board = page.locator(".board-2048");
    const rect = await board.boundingBox();
    await page.mouse.move(rect.x + 40, rect.y + 40);
    await page.mouse.down();
    await page.mouse.move(rect.x + 40, rect.y + 160, { steps: 6 });
    await page.mouse.up();
    await page.keyboard.press("Escape");
    await expect(page.locator("#game-dialog")).not.toBeVisible();
});

test("Memory can be completed and reaction handles early clicks and five rounds", async ({
    page,
}) => {
    await page.clock.install();
    await page.locator('[data-play="memory"]').click();
    const known = new Map();
    for (let i = 0; i < 16; i += 2) {
        for (const index of [i, i + 1]) {
            const tile = page.locator(".memory-tile").nth(index);
            await tile.click();
            const symbol = await tile.textContent();
            if (!known.has(symbol)) known.set(symbol, []);
            known.get(symbol).push(index);
        }
        await page.clock.runFor(900);
    }
    for (const indices of known.values()) {
        if (await page.locator(".memory-tile").nth(indices[0]).isDisabled())
            continue;
        await page.locator(".memory-tile").nth(indices[0]).click();
        await page.locator(".memory-tile").nth(indices[1]).click();
    }
    await expect(page.locator("#game-status")).toContainText(
        "Alle paren gevonden",
    );
    await page.locator("#close-game").click();
    await page.locator('[data-play="reaction"]').click();
    await page.locator(".reaction-target").click();
    await page.locator(".reaction-target").click();
    await expect(page.locator("#game-status")).toContainText("Te vroeg");
    for (let round = 0; round < 5; round++) {
        await page.locator(".reaction-target").click();
        await page.clock.runFor(4500);
        await expect(page.locator(".reaction-target")).toHaveClass(
            "reaction-target ready",
        );
        await page.locator(".reaction-target").click();
    }
    await expect(page.locator("#game-stat")).toContainText(
        "5/5 rondes afgerond",
    );
});

test("layout fits narrow screens and help and random game controls work", async ({
    page,
}) => {
    for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
            await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth,
            ),
            `overflow at ${width}px`,
        ).toBe(true);
    }
    await page.locator("#help-open").click();
    await expect(page.locator("#help-dialog")).toBeVisible();
    await page.locator("#help-done").click();
    for (const selector of ["#random-game", "#surprise-game"]) {
        await page.locator(selector).click();
        await expect(page.locator("#game-dialog")).toBeVisible();
        await page.locator("#close-game").click();
    }
});
