const socket = io("https://multiplayer-demo-9g29.onrender.com");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const keys = {};

const player = {
    x: 200,
    y: 200,
    speed: 5
};

let players = {};

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

socket.on("players", (serverPlayers) => {
    players = serverPlayers;
});

function update() {

    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    socket.emit("move", {
        x: player.x,
        y: player.y
    });
}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let id in players) {

        const p = players[id];

        ctx.fillStyle =
            id === socket.id
            ? "lime"
            : "red";

        ctx.fillRect(p.x, p.y, 50, 50);
    }
}

function gameLoop() {

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();