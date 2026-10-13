const COLORS = [
    "#26303b",
    "#a8ccef",
    "#f6d965",
    "#b6a0df",
    "#c7f36a",
    "#f1abc2",
    "#f8a68e",
    "#91d5bc",
];
function block(context, x, y, size, color) {
    context.fillStyle = color;
    context.fillRect(x + 1, y + 1, size - 2, size - 2);
    context.fillStyle = "#ffffff40";
    context.fillRect(x + 2, y + 2, size - 4, 3);
}
export function renderTetris(context, game) {
    context.fillStyle = "#151c25";
    context.fillRect(0, 0, 400, 480);
    game.board.forEach((row, y) =>
        row.forEach((value, x) =>
            block(context, x * 24, y * 24, 24, COLORS[value]),
        ),
    );
    if (!game.ended) {
        let ghostY = game.y;
        while (game.fits(game.piece, game.x, ghostY + 1)) ghostY++;
        game.piece.forEach((row, y) =>
            row.forEach((value, x) => {
                if (!value) return;
                context.strokeStyle = "#ffffff55";
                context.lineWidth = 1;
                context.strokeRect(
                    (game.x + x) * 24 + 2,
                    (ghostY + y) * 24 + 2,
                    20,
                    20,
                );
                block(
                    context,
                    (game.x + x) * 24,
                    (game.y + y) * 24,
                    24,
                    COLORS[value],
                );
            }),
        );
    }
    context.fillStyle = "#c7f36a";
    context.font = "bold 13px monospace";
    context.fillText("VOLGENDE", 267, 40);
    game.next.forEach((row, y) =>
        row.forEach((value, x) => {
            if (value)
                block(context, 267 + x * 24, 60 + y * 24, 24, COLORS[value]);
        }),
    );
    context.fillStyle = "#fff6df";
    context.font = "bold 28px monospace";
    context.fillText(String(game.level), 267, 202);
    context.font = "12px monospace";
    context.fillText("LEVEL", 267, 165);
    context.fillText("LIJNEN", 267, 254);
    context.font = "bold 28px monospace";
    context.fillText(String(game.lines), 267, 291);
    context.fillStyle = "#9ea8b1";
    context.font = "11px monospace";
    context.fillText("↑ DRAAI", 267, 383);
    context.fillText("↓ ZAK", 267, 407);
    context.fillText("SPATIE DROP", 267, 431);
}
export function renderPong(context, game) {
    context.fillStyle = "#1c302a";
    context.fillRect(0, 0, 480, 360);
    context.strokeStyle = "#ffffff30";
    context.lineWidth = 2;
    context.setLineDash([8, 10]);
    context.beginPath();
    context.moveTo(240, 0);
    context.lineTo(240, 360);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = "#c7f36a";
    context.fillRect(16, game.player, 10, 70);
    context.fillStyle = "#fff6df";
    context.fillRect(454, game.opponent, 10, 70);
    context.beginPath();
    context.arc(game.ball.x, game.ball.y, 6, 0, Math.PI * 2);
    context.fill();
    context.font = "bold 40px monospace";
    context.textAlign = "center";
    context.fillText(String(game.score), 180, 54);
    context.fillText(String(game.opponentScore), 300, 54);
    context.font = "10px monospace";
    context.fillStyle = "#c7f36a";
    context.fillText("JIJ", 180, 72);
    context.fillStyle = "#fff6df";
    context.fillText("CPU", 300, 72);
    context.textAlign = "left";
}
export function renderInvaders(context, game, time) {
    context.fillStyle = "#141a2b";
    context.fillRect(0, 0, 480, 430);
    context.fillStyle = "#ffffff50";
    for (let i = 0; i < 44; i++)
        context.fillRect((i * 73 + 11) % 480, (i * 47 + 19) % 420, 2, 2);
    const sprite = [
        "001000100",
        "000101000",
        "001111100",
        "011010110",
        "111111111",
        "101111101",
        "100000001",
        "001101100",
    ];
    game.enemies.forEach((enemy) => {
        if (!enemy.alive) return;
        context.fillStyle = ["#c7f36a", "#a8ccef", "#f1abc2", "#f6d965"][
            enemy.row
        ];
        sprite.forEach((row, y) =>
            [...row].forEach((pixel, x) => {
                if (pixel === "1")
                    context.fillRect(
                        enemy.x - 13.5 + x * 3,
                        enemy.y - 12 + y * 3,
                        3,
                        3,
                    );
            }),
        );
    });
    if (!game.safe || Math.floor(time / 90) % 2 === 0) {
        context.fillStyle = "#c7f36a";
        context.fillRect(game.player - 16, 395, 32, 10);
        context.fillRect(game.player - 10, 389, 20, 6);
        context.fillRect(game.player - 3, 381, 6, 8);
    }
    context.fillStyle = "#fff6df";
    game.shots.forEach((shot) =>
        context.fillRect(shot.x - 2, shot.y - 9, 4, 12),
    );
    context.fillStyle = "#ff794a";
    game.enemyShots.forEach((shot) =>
        context.fillRect(shot.x - 2, shot.y, 4, 11),
    );
}
