# Pixelclub arcade

De openbare Laravel-startpagina bevat negen gratis browsergames: Pacman, Snake,
Breakout, Memory, Reactie, Tetris, Pong, Space Invaders en 2048. De speelhal heeft
horizontale navigatie, lichte retrovormgeving en kleurrijke gameposters.

## Spelen

Iedere game opent in een dialoog met eigen spelregels en bediening. De bewegende
games hebben pauzeren en hervatten; alle games kunnen opnieuw worden gestart.
Toetsenbord en schermknoppen werken naast muisbediening voor Pong en Breakout,
aanraakbediening voor Space Invaders en swipes voor 2048. De spelregels in de
applicatie beschrijven de afzonderlijke toetsen en doelen.

Favorieten, laatst gespeelde games en scores blijven uitsluitend in het geheugen
van de huidige pagina. Herladen begint een nieuwe sessie. Er zijn geen accounts,
duurzame highscores of uploadfuncties. Er worden geen spelgegevens in
browseropslag, bestanden of de previewdatabase opgeslagen.

## Code

- `resources/views/welcome.blade.php`: gamecollectie, navigatie en dialogen.
- `resources/views/components/arcade-art.blade.php`: eigen vectorillustraties.
- `resources/views/components/arcade-cabinet.blade.php`: arcade-kastillustratie.
- `resources/js/games.js`: oorspronkelijke Snake-, Pacman- en Breakout-spelregels.
- `resources/js/arcade-games.js`: Tetris, Pong, Space Invaders en 2048.
- `resources/js/arcade-renderers.js`: canvasweergave van de nieuwe arcadegames.
- `resources/js/app.js`: zoeken, filters, favorieten, gamebesturing en lifecycle.

## Verificatie

```sh
npm ci
npm test
npm run build
php artisan test
```

De PHP-testbootstrap vereist `TEST_DB_HOST`, `TEST_DB_PORT`, `TEST_DB_DATABASE`,
`TEST_DB_USERNAME` en `TEST_DB_PASSWORD` uit de veilige omgeving. Hij overschrijft
de overgeërfde previewverbinding vóór Laravel start. De routecontrole en
MySQL-connectiecontrole wijzigen geen bestaande gebruikersgegevens.

Voor browsercontroles is Playwright met Chromium en diens systeembibliotheken
nodig. Richt deze in op de ontwikkelmachine of de CI-host:

```sh
npx playwright install --with-deps chromium
npm run test:browser
```

Playwright start een eigen Laravel-webserver op poort 8001 met sessies en cache in
het geheugen. Er wordt geen bestaande previewserver overgenomen. De browsertests
controleren zoeken en resetten, collecties en favorieten, alle negen games,
pauzeren en opnieuw starten, toetsenbordbesturing, 2048-swipes, een volledig
Memory-spel, vijf Reactie-rondes, spelregels en schermbreedtes van 320 tot 1440
pixels. De suite draait met desktop- en mobiele browserinstellingen. Tests van
speltijden gebruiken een gecontroleerde klok en zijn geen prestatiemetingen.

Het project heeft geen uploadfunctionaliteit; er is geen uploaddisk betrokken bij
deze arcadeflows. Publicatie en Push to main blijven afzonderlijke handelingen.
