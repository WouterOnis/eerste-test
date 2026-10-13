import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/Browser",
    fullyParallel: false,
    workers: 1,
    timeout: 30000,
    use: {
        baseURL: "http://127.0.0.1:8001",
        reducedMotion: "reduce",
        screenshot: "only-on-failure",
    },
    projects: [
        { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
        {
            name: "mobile",
            use: {
                viewport: { width: 390, height: 844 },
                isMobile: true,
                hasTouch: true,
            },
        },
    ],
    webServer: {
        command: "php artisan serve --host=127.0.0.1 --port=8001",
        url: "http://127.0.0.1:8001",
        reuseExistingServer: false,
        env: { SESSION_DRIVER: "array", CACHE_STORE: "array" },
    },
});
