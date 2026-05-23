const socket = io("https://multiplayer-demo-9g29.onrender.com");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const keys = {};
let wantJump = false;

let players = {};

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    if (e.key === "w") {
        wantJump = true;
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

socket.on("players", (serverPlayers) => {
    players = serverPlayers;
});

function update() {
    socket.emit("move", {
        left: keys["a"],
        right: keys["d"],
        jump: wantJump
    });

    wantJump = false;
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
