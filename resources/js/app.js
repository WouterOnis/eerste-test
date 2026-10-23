import {
    createTetris,
    createPong,
    createInvaders,
    create2048,
} from "./arcade-games.js";
import {
    renderTetris,
    renderPong,
    renderInvaders,
} from "./arcade-renderers.js";
import {
    createSnake,
    createBreakout,
    createPacman,
    PACMAN_STEP_MS,
    pacmanPosition,
    MAZE,
    shuffled,
} from "./games";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const games = {
    snake: {
        title: "Snake",
        instructions:
            "Gebruik de pijltjestoetsen, WASD of de schermknoppen. Eet de roze pixels en raak de muur of je eigen staart niet.",
    },
    breakout: {
        title: "Breakout",
        instructions:
            "Beweeg met ← →, A/D, je muis of je vinger. Tik op het veld of druk op spatie om de bal te starten. Breek alle blokken met je drie levens.",
    },
    memory: {
        title: "Memory",
        instructions:
            "Draai twee kaarten om en vind de acht paren. Hoe minder beurten je nodig hebt, hoe beter! Gebruik ook Tab en Enter om kaarten te kiezen.",
    },
    reaction: {
        title: "Reactie",
        instructions:
            "Start een ronde, wacht totdat het vlak groen wordt en klik of tik zo snel mogelijk. Vijf rondes bepalen je gemiddelde reactietijd.",
    },
    pacman: {
        title: "Pacman",
        instructions:
            "Gebruik de pijltjestoetsen, WASD of de schermknoppen. Verzamel alle stippen en ontwijk de spoken. Een grote power-pellet maakt spoken tijdelijk eetbaar.",
    },
};
const canvasGames = {
    snake: {
        factory: createSnake,
        width: 480,
        height: 480,
        interval: () => 130,
        draw: drawSnake,
    },
    pacman: {
        factory: createPacman,
        width: 456,
        height: 456,
        interval: () => PACMAN_STEP_MS,
        draw: drawPacman,
    },
    breakout: {
        factory: createBreakout,
        width: 480,
        height: 380,
        interval: () => 1000 / 60,
        draw: drawBreakout,
    },
    tetris: {
        factory: createTetris,
        width: 400,
        height: 480,
        interval: (game) => Math.max(100, 600 - (game.level - 1) * 55),
        draw: drawTetris,
    },
    pong: {
        factory: createPong,
        width: 480,
        height: 360,
        interval: () => 1000 / 60,
        draw: drawPong,
    },
    invaders: {
        factory: createInvaders,
        width: 480,
        height: 430,
        interval: () => 1000 / 60,
        draw: drawInvaders,
    },
};
const continuousGames = ["breakout", "pong", "invaders"];
Object.assign(games, {
    tetris: {
        title: "Tetris",
        instructions:
            "← → of A/D bewegen, ↑ of W draaien, ↓ of S zakken. Spatie laat het blok direct vallen. Maak complete lijnen en speel steeds sneller. Ook speelbaar met de schermknoppen.",
    },
    pong: {
        title: "Pong",
        instructions:
            "Beweeg je paddle met ↑ ↓, W/S, je muis of je vinger. Spatie of de Start-knop start elke bal. Scoor vijf punten om de computer te verslaan.",
    },
    invaders: {
        title: "Space Invaders",
        instructions:
            "Beweeg met ← → of A/D. Spatie of de vuurknop schiet; houd ingedrukt voor automatisch vuur. Je kunt ook op het veld tikken. Versla alle aliens voordat ze landen. Je hebt drie levens.",
    },
    2048: {
        title: "2048",
        instructions:
            "Gebruik de pijltjestoetsen, WASD, de schermknoppen of swipe over het bord. Gelijke getallen worden opgeteld. Bereik 2048 voordat het bord volloopt!",
    },
});
const favorites = new Set();
const recent = new Set();
let view = "all";
let category = "all";
const search = $("#game-search");

function filterGames() {
    const term = search.value.trim().toLocaleLowerCase("nl");
    let count = 0;
    $$(".game-card").forEach((card) => {
        const allowed =
            view === "all" ||
            (view === "favorites"
                ? favorites.has(card.dataset.game)
                : recent.has(card.dataset.game));
        card.hidden =
            !allowed ||
            (category !== "all" && category !== card.dataset.category) ||
            !card.dataset.search.includes(term);
        if (!card.hidden) count++;
    });
    $("#empty-state").hidden = count > 0;
    $("#empty-message").textContent =
        view === "favorites" && !favorites.size
            ? "Tik op het hartje bij een game om je favorieten hier te verzamelen."
            : view === "recent" && !recent.size
              ? "Speel je eerste potje. Je games verschijnen daarna hier."
              : "Geen games gevonden. Probeer een andere zoekterm of categorie.";
    $("#games-title").firstChild.textContent = {
        all: "De speelhal ",
        favorites: "Jouw favorieten ",
        recent: "Laatst gespeeld ",
    }[view];
    $("#games-title span").textContent =
        `${count} ${count === 1 ? "game" : "games"}`;
}
search.addEventListener("input", filterGames);
$$("[data-view]").forEach((button) =>
    button.addEventListener("click", () => {
        view = button.dataset.view;
        $$("[data-view]").forEach((item) => {
            item.classList.toggle("active", item === button);
            item.setAttribute("aria-pressed", String(item === button));
        });
        $("#breadcrumb-view").textContent = {
            all: "Alle games",
            favorites: "Favorieten",
            recent: "Laatst gespeeld",
        }[view];
        filterGames();
        $(".games-section").scrollIntoView({
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "instant"
                : "smooth",
            block: "start",
        });
    }),
);
$$("[data-category]")
    .filter((button) => button.tagName === "BUTTON")
    .forEach((button) =>
        button.addEventListener("click", () => {
            category = button.dataset.category;
            $$(".filter").forEach((item) => {
                item.classList.toggle("active", item === button);
                item.setAttribute("aria-pressed", String(item === button));
            });
            filterGames();
        }),
    );
$$("[data-favorite]").forEach((button) =>
    button.addEventListener("click", () => {
        const id = button.dataset.favorite;
        if (favorites.has(id)) favorites.delete(id);
        else favorites.add(id);
        button.setAttribute("aria-pressed", String(favorites.has(id)));
        button.setAttribute(
            "aria-label",
            `${games[id].title} ${favorites.has(id) ? "verwijderen uit" : "toevoegen aan"} favorieten`,
        );
        $("#favorite-count").textContent = favorites.size;
        filterGames();
    }),
);
$("#reset-filters").addEventListener("click", () => {
    view = "all";
    category = "all";
    search.value = "";
    $$("[data-view]").forEach((button) => {
        button.classList.toggle("active", button.dataset.view === "all");
        button.setAttribute(
            "aria-pressed",
            String(button.dataset.view === "all"),
        );
    });
    $$(".filter").forEach((button) => {
        button.classList.toggle("active", button.dataset.category === "all");
        button.setAttribute(
            "aria-pressed",
            String(button.dataset.category === "all"),
        );
    });
    $("#breadcrumb-view").textContent = "Alle games";
    filterGames();
});

const help = $("#help-dialog");
$("#help-open").addEventListener("click", () => help.showModal());
$("#help-close").addEventListener("click", () => help.close());
$("#help-done").addEventListener("click", () => help.close());
const dialog = $("#game-dialog");
const stage = $("#game-stage");
const status = $("#game-status");
const stat = $("#game-stat");
const pauseButton = $("#pause-game");
let currentId = null;
let engine = null;
let session = null;
let paused = false;
let frameId = null;
let timers = new Set();
let canvas, context;
let lastTime = 0,
    accumulated = 0;

function later(callback, delay) {
    const timer = setTimeout(() => {
        timers.delete(timer);
        callback();
    }, delay);
    timers.add(timer);
    return timer;
}
function stopGame() {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
    timers.forEach(clearTimeout);
    timers.clear();
    session?.abort();
    session = null;
    engine = null;
}
function setPaused(value) {
    if (!engine || engine.ended || !canvasGames[currentId]) return;
    paused = value;
    pauseButton.querySelector("span").textContent = value ? "Verder" : "Pauze";
    pauseButton
        .querySelector("use")
        .setAttribute("href", value ? "#i-play" : "#i-pause");
    stage.querySelector(".canvas-overlay")?.remove();
    if (value) {
        const overlay = document.createElement("div");
        overlay.className = "canvas-overlay";
        overlay.textContent = "Even pauze.";
        stage.append(overlay);
        resetHeldControls();
    }
    lastTime = 0;
    if (currentId !== "pacman") accumulated = 0;
}
function createCanvas(width, height) {
    canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.setAttribute(
        "aria-label",
        `${games[currentId].title} speelveld. ${games[currentId].instructions}`,
    );
    canvas.setAttribute("role", "img");
    canvas.tabIndex = 0;
    stage.append(canvas);
    context = canvas.getContext("2d");
    canvas.focus();
}
function roundRect(x, y, width, height, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.fill();
}
function drawSnake() {
    const cell = 24;
    context.fillStyle = "#13221e";
    context.fillRect(0, 0, 480, 480);
    context.strokeStyle = "#ffffff05";
    context.lineWidth = 1;
    for (let i = 0; i <= 480; i += cell) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, 480);
        context.moveTo(0, i);
        context.lineTo(480, i);
        context.stroke();
    }
    roundRect(
        engine.food.x * cell + 5,
        engine.food.y * cell + 5,
        14,
        14,
        4,
        "#f29fae",
    );
    engine.body.forEach((part, i) =>
        roundRect(
            part.x * cell + 2,
            part.y * cell + 2,
            20,
            20,
            4,
            i === 0 ? "#d0f79d" : "#8ec66b",
        ),
    );
    const head = engine.body[0];
    const horizontal = ["left", "right"].includes(engine.direction);
    const shift = ["right", "down"].includes(engine.direction) ? 14 : 6;
    roundRect(
        head.x * cell + (horizontal ? shift : 6),
        head.y * cell + (horizontal ? 6 : shift),
        3,
        3,
        1,
        "#263d24",
    );
    roundRect(
        head.x * cell + (horizontal ? shift : 15),
        head.y * cell + (horizontal ? 15 : shift),
        3,
        3,
        1,
        "#263d24",
    );
    stat.textContent = `Score: ${engine.score}`;
    status.textContent = engine.ended
        ? engine.won
            ? "Het hele veld gevuld! Jij bent de Snake-kampioen."
            : `Game over! Je score: ${engine.score}. Zin in nog een potje?`
        : engine.started
          ? "Elke pixel telt. Blijf groeien!"
          : "Druk op een richting om te starten.";
}
function drawBreakout() {
    context.fillStyle = "#221b23";
    context.fillRect(0, 0, 480, 380);
    const colors = ["#f0989c", "#f4b184", "#edcf8b", "#b2d794"];
    engine.bricks.forEach((brick) => {
        if (brick.alive)
            roundRect(brick.x, brick.y, brick.w, brick.h, 4, colors[brick.row]);
    });
    roundRect(engine.paddle, 347, 90, 12, 6, "#c3a3eb");
    context.beginPath();
    context.arc(engine.ball.x, engine.ball.y, 7, 0, Math.PI * 2);
    context.fillStyle = "#fff4d5";
    context.fill();
    stat.textContent = `Score: ${engine.score} · Levens: ${engine.lives}`;
    status.textContent = engine.ended
        ? engine.won
            ? `Alles kapot! Gewonnen met ${engine.score} punten.`
            : `Game over! Je score: ${engine.score}. Probeer het opnieuw.`
        : engine.started
          ? "Hou de bal in het spel!"
          : "Tik op het veld of druk op spatie om de bal te starten.";
}
function drawPacman(time) {
    const cell = 24;
    context.fillStyle = "#111722";
    context.fillRect(0, 0, 456, 456);
    MAZE.forEach((row, y) =>
        [...row].forEach((tile, x) => {
            if (tile === "#") {
                roundRect(x * cell + 2, y * cell + 2, 20, 20, 4, "#283852");
                context.strokeStyle = "#49618a";
                context.stroke();
            }
        }),
    );
    engine.pellets.forEach((points, key) => {
        const [x, y] = key.split(",").map(Number);
        context.beginPath();
        context.arc(
            x * cell + 12,
            y * cell + 12,
            points === 50 ? 6 : 2,
            0,
            Math.PI * 2,
        );
        context.fillStyle = "#ebd6a2";
        context.fill();
    });
    const angles = {
        right: 0,
        down: Math.PI / 2,
        left: Math.PI,
        up: -Math.PI / 2,
    };
    const progress = engine.started && !engine.ended
        ? accumulated / PACMAN_STEP_MS
        : 1;
    const player = pacmanPosition(engine.previousPlayer, engine.player, progress);
    const angle = angles[engine.direction];
    const mouth = 0.15 + Math.abs(Math.sin(time / 100)) * 0.3;
    context.save();
    context.translate(player.x * cell + 12, player.y * cell + 12);
    context.rotate(angle);
    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, 10, mouth, Math.PI * 2 - mouth);
    context.closePath();
    context.fillStyle =
        engine.safe > 0 && Math.floor(time / 120) % 2 ? "#fff1b5" : "#f3d268";
    context.fill();
    context.restore();
    engine.ghosts.forEach((ghost, i) => {
        if (ghost.cooldown > 0) return;
        const previous = engine.previousGhosts?.[i];
        const position = pacmanPosition(
            previous?.cooldown > 0 ? null : previous,
            ghost,
            progress,
        );
        const x = position.x * cell + 3,
            y = position.y * cell + 3;
        roundRect(
            x,
            y,
            18,
            18,
            [9, 9, 2, 2],
            engine.power > 0 ? "#738aba" : ["#ef93b1", "#89d8d2", "#c49bec"][i],
        );
        roundRect(x + 3, y + 6, 5, 6, 2, "white");
        roundRect(x + 10, y + 6, 5, 6, 2, "white");
        roundRect(x + 5, y + 8, 2, 3, 1, "#26334b");
        roundRect(x + 12, y + 8, 2, 3, 1, "#26334b");
    });
    stat.textContent = `Score: ${engine.score} · Levens: ${engine.lives}`;
    status.textContent = engine.ended
        ? engine.won
            ? `Alle stippen gepakt! Gewonnen met ${engine.score} punten.`
            : `Game over! Je score: ${engine.score}. Nog een rondje?`
        : !engine.started
          ? "Druk op een richting om te starten."
          : engine.power > 0
            ? "Power-pellet! Nu mag je de spoken pakken."
            : `Nog ${engine.pellets.size} stippen te gaan. Pas op voor de spoken!`;
}
function drawTetris() {
    renderTetris(context, engine);
    stat.textContent = "Score: " + engine.score + " · Lijnen: " + engine.lines;
    status.textContent = engine.ended
        ? "Game over! Score: " + engine.score + ". Nog een keer?"
        : "Level " +
          engine.level +
          " · Maak complete lijnen. Spatie = direct laten vallen.";
}
function drawPong() {
    renderPong(context, engine);
    stat.textContent =
        "Jij: " + engine.score + " · Computer: " + engine.opponentScore;
    status.textContent = engine.ended
        ? engine.won
            ? "Gewonnen! Jij bent de Pong-kampioen."
            : "De computer wint. Tijd voor een revanche?"
        : engine.started
          ? "De eerste met vijf punten wint!"
          : "Druk op spatie, tik op het veld of kies Start om te serveren.";
}
function drawInvaders(time) {
    renderInvaders(context, engine, time);
    stat.textContent = "Score: " + engine.score + " · Levens: " + engine.lives;
    status.textContent = engine.ended
        ? engine.won
            ? "Alle aliens verslagen! De aarde is weer veilig."
            : "Game over! Score: " + engine.score + ". Nog een missie?"
        : engine.started
          ? "Houd spatie of de vuurknop ingedrukt. Ontwijk de rode kogels!"
          : "Druk op spatie of kies Vuur om je missie te starten.";
}
function animate(time) {
    if (!dialog.open || !engine) return;
    const mode = canvasGames[currentId];
    const interval = mode.interval(engine);
    if (!paused && !engine.ended) {
        if (lastTime) accumulated += Math.min(time - lastTime, 100);
        while (accumulated >= interval && !engine.ended) {
            engine.step();
            accumulated -= interval;
        }
    }
    lastTime = time;
    mode.draw(time);
    pauseButton.disabled = engine.ended;
    updateControlStates();
    frameId = engine.ended ? null : requestAnimationFrame(animate);
}
function startMemory() {
    const symbols = ["✦", "☀", "☾", "♣", "♥", "♦", "♫", "⚡"];
    const values = shuffled([...symbols, ...symbols]);
    const board = document.createElement("div");
    board.className = "memory-board";
    stage.append(board);
    let selected = [],
        matched = 0,
        moves = 0,
        locked = false;
    stat.textContent = "Beurten: 0 · Paren: 0/8";
    status.textContent = "Vind jij de perfecte match?";
    values.forEach((symbol, i) => {
        const tile = document.createElement("button");
        tile.className = "memory-tile";
        tile.textContent = "?";
        tile.setAttribute("aria-label", `Kaart ${i + 1}, omdraaien`);
        tile.addEventListener(
            "click",
            () => {
                if (
                    locked ||
                    tile.disabled ||
                    selected.some((item) => item.tile === tile)
                )
                    return;
                tile.textContent = symbol;
                tile.classList.add("revealed");
                tile.setAttribute("aria-label", `Kaart ${i + 1}: ${symbol}`);
                selected.push({ tile, symbol, index: i });
                if (selected.length !== 2) return;
                moves++;
                stat.textContent = `Beurten: ${moves} · Paren: ${matched}/8`;
                if (selected[0].symbol === selected[1].symbol) {
                    selected.forEach((item) => {
                        item.tile.classList.add("matched");
                        item.tile.disabled = true;
                    });
                    matched++;
                    selected = [];
                    stat.textContent = `Beurten: ${moves} · Paren: ${matched}/8`;
                    status.textContent =
                        matched === 8
                            ? `Alle paren gevonden in ${moves} beurten. Goed gespeeld!`
                            : "Een match! Op naar het volgende paar.";
                } else {
                    locked = true;
                    status.textContent = "Onthoud ze goed…";
                    later(() => {
                        selected.forEach((item) => {
                            item.tile.textContent = "?";
                            item.tile.classList.remove("revealed");
                            item.tile.setAttribute(
                                "aria-label",
                                `Kaart ${item.index + 1}, omdraaien`,
                            );
                        });
                        selected = [];
                        locked = false;
                        status.textContent = "Probeer een ander paar.";
                    }, 850);
                }
            },
            { signal: session.signal },
        );
        board.append(tile);
    });
}
function startReaction() {
    const target = document.createElement("button");
    target.className = "reaction-target";
    stage.append(target);
    let phase = "idle",
        started = 0,
        waitTimer = null;
    const results = [];
    function label(text, subtitle, icon = "bolt") {
        target.replaceChildren();
        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg",
        );
        const use = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "use",
        );
        use.setAttribute("href", `#i-${icon}`);
        svg.append(use);
        const title = document.createElement("span");
        title.textContent = text;
        const small = document.createElement("small");
        small.textContent = subtitle;
        target.append(svg, title, small);
    }
    label(
        "Klaar voor de start?",
        "Klik of tik om de eerste ronde te starten.",
        "play",
    );
    stat.textContent = "Ronde: 1/5";
    status.textContent = "Wacht op groen. Dan pas tikken!";
    target.addEventListener(
        "click",
        () => {
            if (phase === "idle" || phase === "result") {
                if (results.length === 5) return;
                phase = "waiting";
                target.className = "reaction-target waiting";
                label("Wacht op groen…", "Nog niet tikken!");
                status.textContent = "Concentreer je op de kleur.";
                waitTimer = later(
                    () => {
                        phase = "ready";
                        target.className = "reaction-target ready";
                        label("NU!", "Klik of tik zo snel mogelijk.");
                        started = performance.now();
                    },
                    1800 + Math.random() * 2500,
                );
            } else if (phase === "waiting") {
                clearTimeout(waitTimer);
                timers.delete(waitTimer);
                phase = "idle";
                target.className = "reaction-target";
                label(
                    "Iets te enthousiast!",
                    "Tik om deze ronde opnieuw te proberen.",
                    "reset",
                );
                status.textContent = "Te vroeg! Deze poging telt niet mee.";
            } else if (phase === "ready") {
                const elapsed = Math.max(
                    1,
                    Math.round(performance.now() - started),
                );
                results.push(elapsed);
                phase = "result";
                target.className = "reaction-target result";
                if (results.length === 5) {
                    const average = Math.round(
                        results.reduce((total, value) => total + value, 0) / 5,
                    );
                    label(
                        `${average} ms gemiddeld`,
                        `Je snelste reactie: ${Math.min(...results)} ms`,
                        "star",
                    );
                    stat.textContent = "5/5 rondes afgerond";
                    status.textContent =
                        "Mooi gedaan! Kies Opnieuw voor een nieuwe uitdaging.";
                } else {
                    label(
                        `${elapsed} ms`,
                        "Tik voor de volgende ronde.",
                        "bolt",
                    );
                    stat.textContent = `Volgende ronde: ${results.length + 1}/5`;
                    status.textContent = `Beste tot nu toe: ${Math.min(...results)} ms`;
                }
            }
        },
        { signal: session.signal },
    );
}
function resetHeldControls() {
    if (!engine) return;
    for (const name of ["left", "right", "up", "down", "firing"])
        engine[name] = false;
}
function render2048() {
    $$(".tile-2048").forEach((tile, i) => {
        const value = engine.board[Math.floor(i / 4)][i % 4];
        tile.textContent = value || "";
        tile.dataset.value = value;
        tile.setAttribute(
            "aria-label",
            "Rij " +
                (Math.floor(i / 4) + 1) +
                ", kolom " +
                ((i % 4) + 1) +
                ": " +
                (value || "leeg"),
        );
    });
    updateControlStates();
    stat.textContent = "Score: " + engine.score;
    status.textContent = engine.ended
        ? engine.won
            ? "2048! Gewonnen. Tijd voor een nieuw record?"
            : "Geen zetten meer mogelijk. Score: " + engine.score + "."
        : "Schuif gelijke tegels naar elkaar toe.";
}
function start2048() {
    engine = create2048();
    const board = document.createElement("div");
    board.className = "board-2048";
    board.tabIndex = 0;
    board.setAttribute("role", "group");
    board.setAttribute("aria-label", "2048 speelbord");
    for (let i = 0; i < 16; i++) {
        const tile = document.createElement("div");
        tile.className = "tile-2048";
        board.append(tile);
    }
    stage.append(board);
    render2048();
    board.focus();
    let start = null;
    board.addEventListener(
        "pointerdown",
        (event) => {
            start = { x: event.clientX, y: event.clientY };
            board.setPointerCapture(event.pointerId);
        },
        { signal: session.signal },
    );
    board.addEventListener(
        "pointerup",
        (event) => {
            if (!start) return;
            const dx = event.clientX - start.x,
                dy = event.clientY - start.y;
            start = null;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return;
            handleDirection(
                Math.abs(dx) > Math.abs(dy)
                    ? dx > 0
                        ? "right"
                        : "left"
                    : dy > 0
                      ? "down"
                      : "up",
            );
        },
        { signal: session.signal },
    );
    board.addEventListener(
        "pointercancel",
        () => {
            start = null;
        },
        { signal: session.signal },
    );
}
function updateControlStates() {
    $$("[data-direction]").forEach((button) => {
        button.disabled = Boolean(engine?.ended);
    });
    $("#action-game").disabled = Boolean(engine?.ended);
}
function configureControls(id) {
    $$("[data-direction]").forEach((button) => {
        button.disabled = false;
    });
    $("#action-game").disabled = false;
    $("#touch-controls").hidden = !canvasGames[id] && id !== "2048";
    const horizontal = ["breakout", "invaders"].includes(id);
    $$("[data-direction]").forEach((button) => {
        button.hidden = horizontal
            ? ["up", "down"].includes(button.dataset.direction)
            : id === "pong" &&
              ["left", "right"].includes(button.dataset.direction);
    });
    $('[data-control-label="up"]').textContent =
        id === "tetris" ? "Draaien" : "Omhoog";
    $('[data-control-label="down"]').textContent =
        id === "tetris" ? "Zakken" : "Omlaag";
    const labels = {
        tetris: "Drop blok",
        pong: "Start bal",
        breakout: "Start bal",
        invaders: "Vuur",
    };
    $("#action-game").hidden = !labels[id];
    $("#action-game span").textContent = labels[id] || "Actie";
}
function installPointerControls(id) {
    if (!continuousGames.includes(id)) return;
    const point = (event) => {
        const bounds = canvas.getBoundingClientRect();
        const value =
            id === "pong"
                ? ((event.clientY - bounds.top) * canvas.height) / bounds.height
                : ((event.clientX - bounds.left) * canvas.width) / bounds.width;
        engine.move(value);
    };
    canvas.addEventListener(
        "pointermove",
        (event) => {
            if (
                !paused &&
                !engine.ended &&
                (event.pointerType === "mouse" || event.buttons)
            )
                point(event);
        },
        { signal: session.signal },
    );
    canvas.addEventListener(
        "pointerdown",
        (event) => {
            if (paused || engine.ended) return;
            point(event);
            performAction();
            canvas.setPointerCapture(event.pointerId);
            if (id === "invaders") engine.firing = true;
        },
        { signal: session.signal },
    );
    const release = () => {
        if (id === "invaders") engine.firing = false;
    };
    canvas.addEventListener("pointerup", release, { signal: session.signal });
    canvas.addEventListener("pointercancel", release, {
        signal: session.signal,
    });
}
function startGame(id) {
    stopGame();
    currentId = id;
    paused = false;
    accumulated = 0;
    lastTime = 0;
    session = new AbortController();
    stage.replaceChildren();
    $("#game-title").textContent = games[id].title;
    $("#game-instructions").textContent = games[id].instructions;
    pauseButton.hidden = !canvasGames[id];
    pauseButton.disabled = false;
    pauseButton.querySelector("span").textContent = "Pauze";
    pauseButton.querySelector("use").setAttribute("href", "#i-pause");
    configureControls(id);
    if (id === "memory") {
        startMemory();
        stage.querySelector("button").focus();
    } else if (id === "reaction") {
        startReaction();
        stage.querySelector("button").focus();
    } else if (id === "2048") start2048();
    else {
        const mode = canvasGames[id];
        engine = mode.factory();
        createCanvas(mode.width, mode.height);
        installPointerControls(id);
        mode.draw(performance.now());
        frameId = requestAnimationFrame(animate);
    }
}
function openGame(id) {
    recent.delete(id);
    recent.add(id);
    filterGames();
    dialog.showModal();
    startGame(id);
}
$$("[data-play]").forEach((button) =>
    button.addEventListener("click", () => openGame(button.dataset.play)),
);
const surprise = () => {
    const ids = Object.keys(games);
    openGame(ids[Math.floor(Math.random() * ids.length)]);
};
$("#random-game").addEventListener("click", surprise);
$("#surprise-game").addEventListener("click", surprise);
$("#close-game").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
    stopGame();
    currentId = null;
});
$("#restart-game").addEventListener("click", () => startGame(currentId));
pauseButton.addEventListener("click", () => setPaused(!paused));
function handleDirection(direction, held = false) {
    if (!engine || paused || engine.ended) return;
    if (["snake", "pacman", "2048"].includes(currentId)) {
        engine.turn(direction);
        if (currentId === "2048") render2048();
    } else if (currentId === "tetris") {
        if (direction === "up") engine.rotate();
        else if (direction === "down") engine.drop();
        else engine.move(direction === "left" ? -1 : 1);
        drawTetris();
    } else if (currentId === "pong") {
        if (!["up", "down"].includes(direction)) return;
        if (held) engine[direction] = true;
        else engine.move(engine.player + 35 + (direction === "up" ? -25 : 25));
    } else if (["breakout", "invaders"].includes(currentId)) {
        if (!["left", "right"].includes(direction)) return;
        if (held) engine[direction] = true;
        else
            engine.move(
                (currentId === "breakout"
                    ? engine.paddle + 45
                    : engine.player) + (direction === "left" ? -25 : 25),
            );
    }
}
function performAction() {
    if (!engine || paused || engine.ended) return;
    if (currentId === "tetris") {
        engine.drop(true);
        drawTetris();
    } else if (currentId === "invaders") engine.fire();
    else if (["pong", "breakout"].includes(currentId)) engine.launch();
}
const keys = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
};
document.addEventListener("keydown", (event) => {
    if (!dialog.open) {
        if (
            event.key === "/" &&
            !help.open &&
            !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
        ) {
            event.preventDefault();
            search.focus();
        }
        return;
    }
    if (!engine) return;
    const direction = keys[event.key] || keys[event.key.toLowerCase()];
    if (direction) {
        event.preventDefault();
        handleDirection(direction, continuousGames.includes(currentId));
    }
    if (event.code === "Space" && document.activeElement.tagName !== "BUTTON") {
        event.preventDefault();
        if (event.repeat && currentId !== "invaders") return;
        if (
            ["invaders", "tetris"].includes(currentId) ||
            (["pong", "breakout"].includes(currentId) && !engine.started)
        ) {
            performAction();
            if (currentId === "invaders" && !paused && !engine.ended)
                engine.firing = true;
        } else setPaused(!paused);
    }
});
document.addEventListener("keyup", (event) => {
    if (!engine) return;
    const direction = keys[event.key] || keys[event.key.toLowerCase()];
    if (continuousGames.includes(currentId) && direction)
        engine[direction] = false;
    if (currentId === "invaders" && event.code === "Space")
        engine.firing = false;
});
$$("[data-direction]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
        if (!engine || paused || engine.ended) return;
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        handleDirection(
            button.dataset.direction,
            continuousGames.includes(currentId),
        );
    });
    const release = () => {
        if (engine && continuousGames.includes(currentId))
            engine[button.dataset.direction] = false;
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
    button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleDirection(button.dataset.direction);
        }
    });
});
$("#action-game").addEventListener("click", performAction);
$("#action-game").addEventListener("pointerdown", (event) => {
    if (currentId !== "invaders" || !engine || paused || engine.ended) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    engine.firing = true;
    engine.fire();
});
const stopFiring = () => {
    if (engine) engine.firing = false;
};
$("#action-game").addEventListener("pointerup", stopFiring);
$("#action-game").addEventListener("pointercancel", stopFiring);
$("#action-game").addEventListener("lostpointercapture", stopFiring);
window.addEventListener("blur", () => {
    resetHeldControls();
    setPaused(true);
});
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        resetHeldControls();
        setPaused(true);
        if (currentId === "reaction" && dialog.open) startGame("reaction");
    }
});
filterGames();
