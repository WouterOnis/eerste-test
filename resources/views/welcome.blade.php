<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f5f1e8">
    <meta name="description" content="Welkom in Pixelclub. Negen gratis browsergames, van Pacman en Tetris tot Space Invaders en 2048. Kies een game en spelen maar!">
    <title>Pixelclub — Jouw browser. Jouw speelhal.</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
@include('components.icons')
@include('components.arcade-art')
<div class="checker-strip" aria-hidden="true"></div>
<header class="site-header">
    <a class="brand" href="/" aria-label="Pixelclub startpagina"><span class="brand-mark"><svg><use href="#i-game"/></svg></span><span>PIXELCLUB<small>THE BROWSER ARCADE</small></span></a>
    <nav class="main-nav" aria-label="Gamecollecties">
        <button class="nav-item active" data-view="all" aria-pressed="true"><svg><use href="#i-grid"/></svg>De speelhal</button>
        <button class="nav-item" data-view="favorites" aria-pressed="false"><svg><use href="#i-heart"/></svg>Favorieten <span id="favorite-count">0</span></button>
        <button class="nav-item" data-view="recent" aria-pressed="false"><svg><use href="#i-clock"/></svg>Laatst gespeeld</button>
    </nav>
    <button class="button button-outline" id="help-open"><svg><use href="#i-help"/></svg>Spelregels</button>
</header>
<main>
    <section class="welcome" aria-labelledby="welcome-title">
        <div class="welcome-copy">
            <span class="eyebrow"><span class="status-dot"></span> PLAYER ONE, WELKOM THUIS.</span>
            <h1 id="welcome-title">MINDER<br>MOETEN.<br><span>MEER SPELEN.</span></h1>
            <p>Werk kan wachten. De wereld ook.<br>Jouw favoriete classics en nieuwe verslavingen,<br class="desktop-break"> allemaal in één speelhal.</p>
            <div class="welcome-actions"><a class="button button-lime" href="#speelhal"><svg><use href="#i-play"/></svg>Kies je game<svg><use href="#i-arrow"/></svg></a><button class="button button-plain" id="random-game"><svg><use href="#i-shuffle"/></svg>Verras me</button></div>
            <div class="welcome-note"><span aria-hidden="true">↳</span> Geen account. Geen downloads. Gewoon gaan.</div>
        </div>
        <div class="welcome-art">@include('components.arcade-cabinet')<span class="cabinet-caption">INSERT GOOD TIMES <span>↗</span></span></div>
    </section>
    <div class="ticker" aria-label="Gratis browsergames zonder downloads"><span>JUST ONE MORE GAME</span><span aria-hidden="true">✳</span><span>100% GRATIS</span><span aria-hidden="true">✳</span><span>NO DOWNLOADS</span><span aria-hidden="true">✳</span><span>ALL PLAY. NO WORK.</span><span aria-hidden="true">✳</span><span>JUST ONE MORE GAME</span></div>
    <section class="games-section" id="speelhal" aria-labelledby="games-title">
        <div class="section-heading"><div><span class="eyebrow">KIES JE TEGENSTANDER. OF JE TIJDVERDRIJF.</span><h2 id="games-title">De speelhal <span>9 games</span></h2></div><div class="collection-note"><span class="new-dot"></span> Vier verse games erbij!<span class="hand-arrow" aria-hidden="true">↙</span></div></div>
        <div class="collection-toolbar"><div class="filters" role="group" aria-label="Filter games op categorie">
            <button class="filter active" data-category="all" aria-pressed="true"><svg><use href="#i-grid"/></svg>Alles <span>9</span></button>
            <button class="filter" data-category="arcade" aria-pressed="false"><svg><use href="#i-game"/></svg>Arcade</button>
            <button class="filter" data-category="puzzle" aria-pressed="false"><svg><use href="#i-grid"/></svg>Puzzel</button>
            <button class="filter" data-category="reflex" aria-pressed="false"><svg><use href="#i-bolt"/></svg>Reflex</button>
        </div><label class="search"><svg><use href="#i-search"/></svg><input id="game-search" type="search" placeholder="Welke game zoek je?" aria-label="Zoek games"><kbd>/</kbd></label></div>
        <div class="collection-meta"><span id="breadcrumb-view">Alle games</span><span>SINGLE PLAYER · INSTANT FUN</span></div>
        @php
            $games = [
                ['id' => 'pacman', 'title' => 'Pacman', 'category' => 'arcade', 'label' => 'Arcade', 'color' => 'yellow', 'tag' => 'HAP. HAP. HAP.', 'description' => 'Stippen opeten. Spoken ontwijken. De ultieme achtervolging.', 'search' => 'pacman pac man doolhof spoken arcade', 'new' => false],
                ['id' => 'tetris', 'title' => 'Tetris', 'category' => 'puzzle', 'label' => 'Puzzel', 'color' => 'blue', 'tag' => 'ALLES VALT OP ZIJN PLEK.', 'description' => 'Draai, stapel en maak de lijnen leeg. Lekker in de flow.', 'search' => 'tetris blokken lijnen stapelen puzzel', 'new' => true],
                ['id' => 'invaders', 'title' => 'Space Invaders', 'category' => 'arcade', 'label' => 'Arcade', 'color' => 'purple', 'tag' => 'RED JE STUKJE UNIVERSUM.', 'description' => 'Een ruimteschip. Een leger aliens. Jij weet wat je moet doen.', 'search' => 'space invaders ruimte aliens schieten arcade', 'new' => true],
                ['id' => 'snake', 'title' => 'Snake', 'category' => 'arcade', 'label' => 'Arcade', 'color' => 'green', 'tag' => 'NOG ÉÉN HAPJE.', 'description' => 'Klein beginnen, groot eindigen. Blijf uit je eigen knoop.', 'search' => 'snake slang eten arcade', 'new' => false],
                ['id' => 'pong', 'title' => 'Pong', 'category' => 'arcade', 'label' => 'Arcade', 'color' => 'pink', 'tag' => 'TERUG NAAR HET BEGIN.', 'description' => 'Jij tegen de computer. De eerste met vijf punten wint.', 'search' => 'pong ping pong tennis bal computer arcade', 'new' => true],
                ['id' => '2048', 'title' => '2048', 'category' => 'puzzle', 'label' => 'Puzzel', 'color' => 'orange', 'tag' => 'KLEINE GETALLEN. GROTE PLANNEN.', 'description' => 'Schuif, combineer en reken je een weg naar 2048.', 'search' => '2048 getallen tegels samenvoegen puzzel', 'new' => true],
                ['id' => 'breakout', 'title' => 'Breakout', 'category' => 'arcade', 'label' => 'Arcade', 'color' => 'peach', 'tag' => 'MAAK ER EEN PUINHOOP VAN.', 'description' => 'Hou de bal hoog en speel alle blokken aan diggelen.', 'search' => 'breakout blokken bal arcade', 'new' => false],
                ['id' => 'memory', 'title' => 'Memory', 'category' => 'puzzle', 'label' => 'Puzzel', 'color' => 'mint', 'tag' => 'JE HEBT DIT EERDER GEZIEN.', 'description' => 'Zoek de perfecte match. Je geheugen heeft dit.', 'search' => 'memory kaarten geheugen paren puzzel', 'new' => false],
                ['id' => 'reaction', 'title' => 'Reactie', 'category' => 'reflex', 'label' => 'Reflex', 'color' => 'red', 'tag' => 'NIET KNIPPEREN.', 'description' => 'Wacht op groen. Tik bliksemsnel. Versla jezelf.', 'search' => 'reactie reaction reflex snelheid', 'new' => false],
            ];
        @endphp
        <div class="game-grid">
            @foreach ($games as $game)
                <article class="game-card tone-{{ $game['color'] }}" data-game="{{ $game['id'] }}" data-category="{{ $game['category'] }}" data-search="{{ $game['search'] }}">
                    <div class="card-art"><span class="game-number">0{{ $loop->iteration }} / {{ strtoupper($game['label']) }}</span><button class="favorite" data-favorite="{{ $game['id'] }}" aria-label="{{ $game['title'] }} toevoegen aan favorieten" aria-pressed="false"><svg><use href="#i-heart"/></svg><span class="sr-only">Favoriet</span></button>
                        @if ($game['new'])<span class="new-stamp">NIEUW!</span>@endif
                        <svg class="game-illustration" aria-hidden="true"><use href="#art-{{ $game['id'] }}"/></svg>
                        <span class="art-tag">{{ $game['tag'] }}</span>
                    </div>
                    <div class="card-content"><div class="card-title"><h3>{{ $game['title'] }}</h3><span class="category-tag">{{ $game['label'] }}</span></div><p>{{ $game['description'] }}</p><button class="text-play button" data-play="{{ $game['id'] }}"><svg><use href="#i-play"/></svg>Speel {{ $game['title'] }}<svg class="end-icon"><use href="#i-arrow"/></svg></button></div>
                </article>
            @endforeach
        </div>
        <div id="empty-state" class="empty-state" hidden><svg><use href="#i-search"/></svg><h3>Geen game in zicht.</h3><p id="empty-message">Probeer een andere zoekterm.</p><button class="button button-lime" id="reset-filters"><svg><use href="#i-grid"/></svg>Terug naar alle games</button></div>
    </section>
    <section class="one-more"><div class="one-more-symbol" aria-hidden="true">✳</div><div><span class="eyebrow">DE BELANGRIJKSTE SPELREGEL</span><h2>Het mag best<br>nog één potje zijn.</h2><p>Keuzestress? Wij prikken er eentje voor je.</p></div><button class="button button-black" id="surprise-game"><svg><use href="#i-shuffle"/></svg>Gooi de dobbelsteen<svg><use href="#i-arrow"/></svg></button></section>
</main>
<footer class="site-footer"><a class="footer-brand" href="/">PIXELCLUB<span aria-hidden="true">✳</span></a><span>Jouw browser. Jouw speelhal.<br>© {{ date('Y') }} · Gebouwd om te spelen.</span><span class="footer-note">GEEN MUNTJES NODIG.<br>ALLEEN EEN BEETJE TIJD. <svg><use href="#i-heart"/></svg></span></footer>
<dialog id="game-dialog" class="game-dialog" aria-labelledby="game-title">
    <div class="dialog-header"><div><span class="eyebrow">PLAYER 01 · GAME ON</span><h2 id="game-title">Snake</h2></div><button class="button button-outline" id="close-game"><svg><use href="#i-close"/></svg>Sluiten</button></div>
    <p id="game-instructions" class="game-instructions"></p>
    <div class="game-toolbar"><span id="game-stat" aria-live="polite">Score: 0</span><div><button class="button button-outline" id="pause-game"><svg><use href="#i-pause"/></svg><span>Pauze</span></button><button class="button button-outline" id="restart-game"><svg><use href="#i-reset"/></svg>Opnieuw</button></div></div>
    <div id="game-stage" class="game-stage"></div>
    <p id="game-status" class="game-status" role="status"></p>
    <div id="touch-controls" class="touch-controls" hidden><button class="button button-outline" data-direction="up"><span aria-hidden="true">↑</span><span data-control-label="up">Omhoog</span></button><div><button class="button button-outline" data-direction="left"><span aria-hidden="true">←</span>Links</button><button class="button button-outline" data-direction="down"><span aria-hidden="true">↓</span><span data-control-label="down">Omlaag</span></button><button class="button button-outline" data-direction="right"><span aria-hidden="true">→</span>Rechts</button></div></div>
    <div class="extra-controls"><button class="button button-lime" id="action-game" hidden><svg><use href="#i-bolt"/></svg><span>Actie</span></button></div>
    <span class="session-note">Scores, favorieten en laatst gespeelde games gelden voor deze sessie.</span>
</dialog>
<dialog id="help-dialog" class="help-dialog" aria-labelledby="help-title"><div class="dialog-header"><h2 id="help-title">Zo werkt de speelhal.</h2><button class="button button-outline" id="help-close"><svg><use href="#i-close"/></svg>Sluiten</button></div><p>Kies één van de negen games. Je vindt de bediening en spelregels boven het speelveld. Je kunt spelen met je toetsenbord of de schermknoppen. Bij Pong en Breakout werken ook je muis en vinger; 2048 kun je swipen.</p><p>Met het hartje bewaar je een game bij je favorieten voor deze sessie. Bij <strong>Laatst gespeeld</strong> vind je games die je hebt geopend. Liever een verrassing? Gooi de dobbelsteen!</p><p>Met <strong>Pauze</strong> zet je bewegende games stil. Bij het verlaten van het tabblad pauzeren ze automatisch. <strong>Opnieuw</strong> start een nieuw potje.</p><p>Geen account nodig. Favorieten en scores worden niet permanent opgeslagen.</p><button class="button button-lime" id="help-done"><svg><use href="#i-play"/></svg>Begrepen, spelen maar!</button></dialog>
</body>
</html>
