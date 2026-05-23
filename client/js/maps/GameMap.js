/**
 * GameMap.js
 * Dibuja el escenario del juego: fondo con paralaje, cielo estrellado, cuadrícula cibernética y suelo de neón brillante.
 */
export class GameMap {
    constructor(worldWidth = 2000, worldHeight = 1000) {
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.groundY = 550 + 50; // El suelo visual comienza en 600px (y = 550 es el top-left del jugador en el suelo)
        
        // Estrellas estáticas en coordenadas del mundo para el paralaje
        this.stars = [];
        for (let i = 0; i < 120; i++) {
            this.stars.push({
                x: Math.random() * this.worldWidth,
                y: Math.random() * 450, // Solo en la parte superior
                size: Math.random() * 1.8 + 0.6,
                color: Math.random() > 0.4 ? "#66fcf1" : "#ff007f", // Cian o Rosa Neón
                alpha: Math.random() * 0.7 + 0.3
            });
        }
    }

    /**
     * Dibuja la capa de fondo y el cielo estrellado con paralaje.
     * @param {CanvasRenderingContext2D} ctx Contexto 2D del canvas.
     * @param {number} cameraX Posición X actual de la cámara.
     * @param {number} canvasWidth Ancho de la pantalla.
     * @param {number} canvasHeight Alto de la pantalla.
     */
    drawBackground(ctx, cameraX, canvasWidth, canvasHeight) {
        // 1. Degradado del cielo profundo cibernético
        const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        bgGrad.addColorStop(0, "#030408");
        bgGrad.addColorStop(0.5, "#0b0c10");
        bgGrad.addColorStop(1, "#12131c");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 2. Estrellas con paralaje (se desplazan al 20% de la velocidad de la cámara)
        const parallaxFactor = 0.15;
        ctx.save();
        for (const star of this.stars) {
            let sx = (star.x - cameraX * parallaxFactor) % this.worldWidth;
            if (sx < 0) sx += this.worldWidth;
            
            // Solo renderiza si está visible en la ventana
            if (sx < canvasWidth) {
                ctx.fillStyle = star.color;
                ctx.globalAlpha = star.alpha;
                ctx.beginPath();
                ctx.arc(sx, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();

        // 3. Cuadrícula cibernética en perspectiva detrás de las plataformas
        ctx.save();
        ctx.strokeStyle = "rgba(102, 252, 241, 0.04)"; // Cian muy tenue
        ctx.lineWidth = 1;
        
        const gridSpacing = 60;
        const gridHeight = 250;
        const gridStart = this.groundY;
        
        // Líneas horizontales del suelo
        for (let y = gridStart; y < gridStart + gridHeight; y += 25) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.stroke();
        }

        // Líneas verticales inclinadas (efecto de profundidad)
        const vGridFactor = 0.4;
        let startX = Math.floor((cameraX * vGridFactor) / gridSpacing) * gridSpacing;
        for (let x = startX - canvasWidth; x < startX + canvasWidth * 2; x += gridSpacing) {
            let rx = x - cameraX * vGridFactor;
            ctx.beginPath();
            ctx.moveTo(rx, gridStart);
            ctx.lineTo(rx - 80, gridStart + gridHeight);
            ctx.stroke();
        }
        ctx.restore();
    }

    /**
     * Dibuja los elementos físicos del mapa (suelo brillante con glow).
     * @param {CanvasRenderingContext2D} ctx Contexto 2D del canvas.
     */
    drawForeground(ctx) {
        ctx.save();
        
        // Resplandor de neón rosa brillante para el filo de la plataforma
        ctx.shadowColor = "#ff007f";
        ctx.shadowBlur = 12;
        ctx.strokeStyle = "#ff007f";
        ctx.lineWidth = 4;
        
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.lineTo(this.worldWidth, this.groundY);
        ctx.stroke();
        
        // Quitamos la sombra para pintar el cuerpo sólido
        ctx.shadowBlur = 0;
        const groundGrad = ctx.createLinearGradient(0, this.groundY, 0, this.groundY + 400);
        groundGrad.addColorStop(0, "#140115");
        groundGrad.addColorStop(1, "#070008");
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, this.groundY, this.worldWidth, 400);

        // Línea decorativa cian secundaria
        ctx.strokeStyle = "rgba(102, 252, 241, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, this.groundY + 12);
        ctx.lineTo(this.worldWidth, this.groundY + 12);
        ctx.stroke();

        ctx.restore();
    }
}
