const canvas = document.getElementById("jumpCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const overlay = document.getElementById("overlay");

let player, platforms, gravity, jumpStrength, score, highScore, gameActive;

function startGame() {
    score = 0;
    highScore = localStorage.getItem("jumpHighScore") || 0;
    highScoreEl.innerText = highScore;
    scoreEl.innerText = score;
    
    gravity = 0.4;
    jumpStrength = -10;
    gameActive = true;
    overlay.style.display = "none";

    player = {
        x: canvas.width / 2 - 15,
        y: canvas.height - 100,
        w: 30, h: 30,
        vx: 0, vy: 0
    };

    platforms = [];
    for (let i = 0; i < 7; i++) {
        platforms.push({
            x: Math.random() * (canvas.width - 60),
            y: i * 100,
            w: 60, h: 10
        });
    }
    // Base platform
    platforms.push({ x: 0, y: canvas.height - 20, w: canvas.width, h: 20 });

    requestAnimationFrame(update);
}

let keys = {};
window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

function update() {
    if (!gameActive) return;

    // Player Physics
    if (keys["ArrowLeft"]) player.vx = -5;
    else if (keys["ArrowRight"]) player.vx = 5;
    else player.vx = 0;

    player.vy += gravity;
    player.x += player.vx;
    player.y += player.vy;

    // Screen wrap
    if (player.x < -player.w) player.x = canvas.width;
    if (player.x > canvas.width) player.x = -player.w;

    // Platform collision & Scrolling
    if (player.vy > 0) {
        platforms.forEach(p => {
            if (player.x < p.x + p.w && player.x + player.w > p.x &&
                player.y + player.h > p.y && player.y + player.h < p.y + p.h + player.vy) {
                player.vy = jumpStrength;
            }
        });
    }

    // Camera follow (Scroll)
    if (player.y < canvas.height / 2) {
        let diff = canvas.height / 2 - player.y;
        player.y = canvas.height / 2;
        score += Math.floor(diff);
        scoreEl.innerText = score;

        platforms.forEach(p => {
            p.y += diff;
            if (p.y > canvas.height) {
                p.y = 0;
                p.x = Math.random() * (canvas.width - 60);
            }
        });
    }

    // Game Over
    if (player.y > canvas.height) {
        gameActive = false;
        if (score > highScore) localStorage.setItem("jumpHighScore", score);
        overlay.style.display = "block";
        document.querySelector(".overlay h2").innerText = "CRASHED!";
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Platforms
    ctx.fillStyle = "#3b82f6";
    platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(p.x, p.y, p.w, p.h);
    });

    // Draw Player
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(player.x, player.y, player.w, player.h);
}