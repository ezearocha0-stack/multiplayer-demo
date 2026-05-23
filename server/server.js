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
const inputs = {};

const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const PLAYER_SIZE = 50;
const GROUND_Y = 550;
const WORLD_WIDTH = 2000;

function isGrounded(player) {
    return player.y >= GROUND_Y;
}

function applyPhysics(player, input) {
    if (input.left) {
        player.x -= MOVE_SPEED;
    }

    if (input.right) {
        player.x += MOVE_SPEED;
    }

    if (input.jump && isGrounded(player)) {
        player.vy = JUMP_FORCE;
    }

    player.vy += GRAVITY;
    player.y += player.vy;

    if (player.y >= GROUND_Y) {
        player.y = GROUND_Y;
        player.vy = 0;
    }

    player.x = Math.max(0, Math.min(player.x, WORLD_WIDTH - PLAYER_SIZE));
}

setInterval(() => {
    for (const id in players) {
        applyPhysics(players[id], inputs[id] || {});
    }

    io.emit("players", {
        players: players,
        timestamp: Date.now()
    });
}, 1000 / 60);

io.on("connection", (socket) => {

    console.log("Jugador conectado:", socket.id);

    players[socket.id] = {
        x: 100,
        y: 100,
        vy: 0
    };

    inputs[socket.id] = {
        left: false,
        right: false,
        jump: false
    };

    io.emit("players", {
        players: players,
        timestamp: Date.now()
    });

    socket.on("move", (data) => {
        if (!players[socket.id]) {
            return;
        }

        inputs[socket.id] = {
            left: !!data.left,
            right: !!data.right,
            jump: !!data.jump
        };
    });

    socket.on("ping_test", (clientTime) => {
        socket.emit("pong_test", clientTime);
    });

    socket.on("disconnect", () => {

        console.log("Jugador desconectado");

        delete players[socket.id];
        delete inputs[socket.id];

        io.emit("players", {
            players: players,
            timestamp: Date.now()
        });
    });
});

server.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000");
});
