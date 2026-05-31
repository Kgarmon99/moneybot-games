// --- State ---
let gameState = 'START';
let seedWords = 12;
let walletValue = 10000;
let timeRemaining = 60;
let score = 0;

let lastTime = 0;
let spawnTimer = 0;
let spawnRate = 1200; // ms between spawns
let secondTimer = 0;

let enemies = [];
let particles = [];
let floatingTexts = [];

// --- DOM Elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let cw, ch;

const valueDisplay = document.getElementById('valueDisplay');
const seedDisplay = document.getElementById('seedDisplay');
const timeDisplay = document.getElementById('timeDisplay');
const gameContainer = document.getElementById('game-container');

// --- Initialization ---
function resize() {
    const rect = gameContainer.getBoundingClientRect();
    cw = canvas.width = rect.width;
    ch = canvas.height = rect.height;
    
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
}
window.addEventListener('resize', resize);
resize();

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

// Input handling (Mouse & Touch)
canvas.addEventListener('mousedown', handleInput);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for(let i=0; i<e.touches.length; i++) {
        handleInput({ clientX: e.touches[i].clientX, clientY: e.touches[i].clientY });
    }
}, {passive: false});

function startGame() {
    gameState = 'PLAYING';
    seedWords = 12;
    walletValue = 10000;
    timeRemaining = 60;
    spawnRate = 1200;
    enemies = [];
    particles = [];
    floatingTexts = [];
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.add('hidden');
    gameContainer.classList.remove('shake');
    document.getElementById('header').children[1].classList.remove('glow-red');
    document.getElementById('header').children[1].classList.add('glow-purple');
    
    updateUI();
    if(!lastTime) requestAnimationFrame(loop);
}

// --- Game Loop ---
function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    if (gameState === 'PLAYING') {
        update(dt);
        draw();
    } else if (gameState === 'GAMEOVER' || gameState === 'WIN') {
        draw();
    }

    requestAnimationFrame(loop);
}

function update(dt) {
    secondTimer += dt;
    if (secondTimer >= 1000) {
        secondTimer = 0;
        timeRemaining--;
        
        const growth = Math.floor(walletValue * 0.015);
        walletValue += growth;
        createFloatingText(cw/2, ch/2 - 40, `+$${growth}`, '#00ff88');

        spawnRate = Math.max(300, 1200 - ((60 - timeRemaining) * 15));

        if (timeRemaining <= 0) {
            endGame('WIN');
            return;
        }
        updateUI();
    }

    spawnTimer += dt;
    if (spawnTimer >= spawnRate) {
        spawnTimer = 0;
        spawnEnemy();
    }

    const cx = cw / 2;
    const cy = ch / 2;
    const coreRadius = 40;

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        
        const dx = cx - e.x;
        const dy = cy - e.y;
        const dist = Math.hypot(dx, dy);
        
        const vx = (dx / dist) * e.speed;
        const vy = (dy / dist) * e.speed;
        
        e.x += vx * (dt * 0.06);
        e.y += vy * (dt * 0.06);

        if (dist < coreRadius + e.radius) {
            takeDamage(e);
            enemies.splice(i, 1);
        }
    }
    
    updateFX(dt);
}

function spawnEnemy() {
    const types = [
        { name: 'Phishing', color: '#ff3366', speed: 1.5, radius: 15, hp: 1 },
        { name: 'Keylogger', color: '#cc00ff', speed: 2.5, radius: 10, hp: 1 },
        { name: 'Ransomware', color: '#ffaa00', speed: 0.8, radius: 25, hp: 3 }
    ];
    
    let type;
    const r = Math.random();
    if (r < 0.6) type = types[0];
    else if (r < 0.9) type = types[1];
    else type = types[2];

    let x, y;
    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -30 : cw + 30;
        y = Math.random() * ch;
    } else {
        x = Math.random() * cw;
        y = Math.random() < 0.5 ? -30 : ch + 30;
    }

    enemies.push({ ...type, x, y, maxHp: type.hp });
}

function handleInput(e) {
    if (gameState !== 'PLAYING') return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    createParticles(x, y, '#00ff88', 5, 2);

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        const dist = Math.hypot(e.x - x, e.y - y);
        if (dist < e.radius + 20) {
            e.hp--;
            createParticles(e.x, e.y, e.color, 10, e.speed);
            if (window.mbAudio) window.mbAudio.playCoin();
            
            if (e.hp <= 0) {
                createFloatingText(e.x, e.y, e.name.toUpperCase(), e.color);
                enemies.splice(i, 1);
                walletValue += 50;
                updateUI();
            } else {
                e.isHit = 5;
            }
            break;
        }
    }
}

function takeDamage(enemy) {
    seedWords--;
    if (window.mbAudio) window.mbAudio.playHit();
    
    gameContainer.classList.remove('shake');
    void gameContainer.offsetWidth;
    gameContainer.classList.add('shake');
    
    const seedBox = document.getElementById('header').children[1];
    seedBox.classList.remove('glow-purple');
    seedBox.classList.add('glow-red');
    
    createParticles(cw/2, ch/2, '#ff3366', 30, 5);
    createFloatingText(cw/2, ch/2 - 60, `[ WORD STOLEN ]`, '#ff3366');
    
    updateUI();

    if (seedWords <= 0) {
        endGame('GAMEOVER');
    }
}

function endGame(result) {
    gameState = result;
    
    document.getElementById('end-screen').classList.remove('hidden');
    
    if (result === 'WIN') {
        document.getElementById('end-title').innerText = "VAULT SECURED";
        document.getElementById('end-title').style.color = "#00ff88";
        document.getElementById('end-desc').innerText = `You protected your keys for 60 seconds.`;
        document.getElementById('final-score').innerText = `$${Math.floor(walletValue).toLocaleString()}`;
        if (window.mbAudio) window.mbAudio.playWin();
    } else {
        document.getElementById('end-title').innerText = "WALLET DRAINED";
        document.getElementById('end-title').style.color = "#ff3366";
        document.getElementById('end-desc').innerText = `Hackers stole your seed phrase and drained your funds.`;
        document.getElementById('final-score').innerText = `$0`;
        if (window.mbAudio) window.mbAudio.playGameOver();
    }
}

function updateUI() {
    valueDisplay.innerText = `$${Math.floor(walletValue).toLocaleString()}`;
    seedDisplay.innerText = `${seedWords} / 12`;
    timeDisplay.innerText = `${timeRemaining}s`;
}

// --- Drawing ---
function draw() {
    ctx.fillStyle = 'rgba(5, 5, 8, 0.3)';
    ctx.fillRect(0, 0, cw, ch);

    const cx = cw / 2;
    const cy = ch / 2;

    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, ch);
    ctx.moveTo(0, cy); ctx.lineTo(cw, cy);
    ctx.stroke();

    drawHexagon(cx, cy, 40, seedWords > 0 ? '#00ff88' : '#ff3366', seedWords > 0);

    for (let e of enemies) {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        
        if (e.isHit && e.isHit > 0) {
            ctx.fillStyle = '#fff';
            e.isHit--;
        } else {
            ctx.fillStyle = e.color;
        }
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = e.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        if (e.maxHp > 1) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius + 4, -Math.PI/2, (-Math.PI/2) + (Math.PI * 2 * (e.hp / e.maxHp)));
            ctx.stroke();
        }
    }

    drawFX();
}

function drawHexagon(x, y, radius, color, glow) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fill();
    
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    if (glow) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    if (glow) {
        const pulse = Math.abs(Math.sin(Date.now() / 300)) * 10;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(x, y, radius - 10 + pulse, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// --- FX Engine ---
function createParticles(x, y, color, count, speedScale = 1) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10 * speedScale,
            vy: (Math.random() - 0.5) * 10 * speedScale,
            life: 1.0,
            color: color,
            size: Math.random() * 3 + 1
        });
    }
}

function createFloatingText(x, y, text, color) {
    floatingTexts.push({
        x: x,
        y: y,
        text: text,
        color: color,
        life: 1.0,
        vy: -1
    });
}

function updateFX(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt * 0.002;
        if (p.life <= 0) particles.splice(i, 1);
    }
    
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.life -= dt * 0.0015;
        if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
}

function drawFX() {
    for (let p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
    
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px Orbitron';
    for (let ft of floatingTexts) {
        ctx.globalAlpha = ft.life;
        ctx.fillStyle = ft.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
}
