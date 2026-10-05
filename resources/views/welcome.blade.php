<!doctype html>
<html lang="nl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Wonis Runtime Test — Space Arcade</title>
    <link rel="stylesheet" href="/css/arcade.css">
</head>
<body>
    <main class="arcade">
        <header class="header">
            <a class="brand" href="/" aria-label="Wonis Runtime Test home"><span class="brand-icon" aria-hidden="true">▟</span> WONIS<span class="muted"> / ARCADE</span></a>
            <span class="status"><span aria-hidden="true">●</span> Isolated runtime online</span>
        </header>
        <section class="intro">
            <div><p class="eyebrow">RUNTIME EXPERIMENT / 001</p><h1>Wonis Runtime Test<span class="title-dot"></span></h1></div>
            <p class="intro-copy">Jij bent de allerlaatste verdedigingslinie.<br>Ontwijk projectielen. Schiet terug...</p>
        </section>
        <section class="machine" aria-label="Space Invaders spel">
            <div class="hud">
                <div><span class="label">SCORE</span><strong id="score">00000</strong></div>
                <div><span class="label">BEST</span><strong id="best">00000</strong></div>
                <div><span class="label">LEVENS</span><strong id="lives" class="hearts" aria-label="3 levens">♥ ♥ ♥</strong></div>
                <button id="pause" disabled aria-label="Spel pauzeren">Ⅱ <span>Pauze</span></button>
            </div>
            <div class="arena" id="arena">
                <canvas id="game" tabindex="0" aria-label="Speelveld. Beweeg met je muis, sleep met je vinger of gebruik de pijltjestoetsen. Schiet met spatie, muisklik of de vuurknop. Druk op Escape om te pauzeren.">Je browser moet canvas ondersteunen om dit spel te spelen.</canvas>
                <button id="fire" class="fire-button" disabled aria-label="Vuren, houd ingedrukt voor continu vuur">⌖ VUUR</button>
                <div class="scanlines" aria-hidden="true"></div>
                <div class="overlay" id="overlay">
                    <p class="eyebrow" id="overlay-label">SECTOR 01 / EARTH ORBIT</p>
                    <h2 id="overlay-title">STOP THE<br><span>INVASION</span></h2>
                    <p id="overlay-copy">Ontwijk hun Wouter vuur en schiet terug met SPATIE.<br>Houd ingedrukt voor continu vuur. 100 punten per alien.</p>
                    <button class="primary" id="start">Start missie <span aria-hidden="true">↗</span></button>
                    <small id="motion-note">Muis · touch · pijltjestoetsen</small>
                </div>
                <span class="sector" aria-hidden="true">WNS–01 <span>+ DEEP SPACE</span></span>
            </div>
            <footer class="machine-footer"><span><i class="live-dot"></i> <span id="state" role="status">Klaar voor vertrek</span></span><span><span id="wave">GOLF 01</span> · ONTWIJK · VUUR</span></footer>
        </section>
        <div class="instructions"><p><span>↔</span> Muis bewegen of slepen om te sturen</p><p><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd> Werkt ook met je toetsenbord</p><p><kbd>SPATIE</kbd> / klik / VUUR om te schieten</p><p><kbd>ESC</kbd> Even pauze</p></div>
        <footer class="page-footer"><span>BUILT TO EXPLORE.</span><span>WONIS / RUNTIME LAB</span></footer>
        <noscript><p>Schakel JavaScript in om het spel te spelen.</p></noscript>
    </main>
    <script type="module" src="/js/arcade.js?v={{ filemtime(public_path('js/arcade.js')) }}"></script>
</body>
</html>
