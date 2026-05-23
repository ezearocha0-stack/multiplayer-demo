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

io.on("connection", (socket) => {

    console.log("Jugador conectado:", socket.id);

    players[socket.id] = {
        x: 100,
        y: 100
    };

    io.emit("players", players);

    socket.on("move", (data) => {

        if (players[socket.id]) {

            players[socket.id].x = data.x;
            players[socket.id].y = data.y;

            io.emit("players", players);
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