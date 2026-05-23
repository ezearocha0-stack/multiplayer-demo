/**
 * networking.js
 * Encapsula toda la comunicación por Socket.IO, cálculo de latencia y detección de entorno.
 */
export class Networking {
    constructor() {
        this.socket = null;
        this.ping = 0;
        
        // Detecta automáticamente si estamos corriendo localmente o en producción.
        this.socketUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
            ? "http://localhost:3000"
            : "https://multiplayer-demo-9g29.onrender.com";
    }

    /**
     * Inicializa la conexión del socket y configura los manejadores de eventos.
     * @param {Function} onPlayersUpdate Callback llamado al recibir la lista de jugadores actualizados.
     * @param {Function} onConnect Callback al conectarse.
     * @param {Function} onDisconnect Callback al desconectarse.
     */
    connect(onPlayersUpdate, onConnect, onDisconnect) {
        // io se encuentra disponible de forma global gracias a la importación en index.html
        this.socket = io(this.socketUrl, {
            transports: ["websocket", "polling"]
        });

        this.socket.on("connect", () => {
            console.log("Conectado al servidor multijugador con ID:", this.socket.id);
            if (onConnect) onConnect(this.socket.id);
            this.startPingInterval();
        });

        this.socket.on("disconnect", () => {
            console.warn("Desconectado del servidor");
            if (onDisconnect) onDisconnect();
        });

        this.socket.on("players", (data) => {
            // Manejador robusto para soportar la estructura con timestamps
            const players = data.players || data;
            const timestamp = data.timestamp || Date.now();
            onPlayersUpdate(players, timestamp);
        });

        this.socket.on("pong_test", (clientTime) => {
            this.ping = Date.now() - clientTime;
        });
    }

    /**
     * Envía la entrada de movimiento actual al servidor.
     * @param {Object} moveData Datos de entrada (left, right, jump).
     */
    sendMove(moveData) {
        if (this.socket && this.socket.connected) {
            this.socket.emit("move", moveData);
        }
    }

    /**
     * Inicia un ciclo periódico para calcular la latencia de la conexión.
     */
    startPingInterval() {
        setInterval(() => {
            if (this.socket && this.socket.connected) {
                this.socket.emit("ping_test", Date.now());
            }
        }, 2000);
    }

    getSocketId() {
        return this.socket ? this.socket.id : null;
    }

    getPing() {
        return this.ping;
    }
}
