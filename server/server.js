const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const players = {};

const GRAVITY = 0.5;
const GROUND_Y = 550;

function applyGravity(player) {
    player.vy += GRAVITY;
    player.y += player.vy;

    if (player.y >= GROUND_Y) {
        player.y = GROUND_Y;
        player.vy = 0;
    }
}

setInterval(() => {
    for (const id in players) {
        applyGravity(players[id]);
    }

    io.emit("players", players);
}, 1000 / 60);

io.on("connection", (socket) => {

    console.log("Jugador conectado:", socket.id);

    players[socket.id] = {
        x: 100,
        y: 100,
        vy: 0
    };

    io.emit("players", players);

    socket.on("move", (data) => {

        if (players[socket.id]) {
            players[socket.id].x = data.x;
        }
    });

    socket.on("disconnect", () => {

        console.log("Jugador desconectado");

        delete players[socket.id];

        io.emit("players", players);
    });
});

server.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000");
});