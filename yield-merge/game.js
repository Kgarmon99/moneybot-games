// Setup Matter.js
const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Events = Matter.Events;

const engine = Engine.create();
const world = engine.world;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-display');
const nextEl = document.getElementById('next-preview');
const modal = document.getElementById('modal');
const dangerLine = document.getElementById('danger-line');

// Fixed internal resolution for consistent physics
const WIDTH = 400;
const HEIGHT = 700;

// Financial Asset Tiers
const ASSETS = [
    { tier: 0, r: 16, color: '#FCD34D', emoji: '🪙', score: 2 },
    { tier: 1, r: 24, color: '#69F0AE', emoji: '💵', score: 4 },
    { tier: 2, r: 34, color: '#38BDF8', emoji: '📄', score: 8 },
    { tier: 3, r: 46, color: '#818CF8', emoji: '🏢', score: 16 },
    { tier: 4, r: 60, color: '#F472B6', emoji: '🏠', score: 32 },
    { tier: 5, r: 76, color: '#A78BFA', emoji: '🏦', score: 64 },
    { tier: 6, r: 94, color: '#FBBF24', emoji: '🏆', score: 128 },
    { tier: 7, r: 116, color: '#2DD4BF', emoji: '💎', score: 256 },
    { tier: 8, r: 140, color: '#00E676', emoji: '🤖', score: 512 }
];

let state = {
    isPlaying: false,
    score: 0,
    nextTier: 0,
    dropX: WIDTH / 2,
    canDrop: true,
    gameOverTimer: 0
};

// Walls
const wallOptions = { isStatic: true, render: { visible: false }, friction: 0.1, restitution: 0.2 };
Composite.add(world, [
    Bodies.rectangle(WIDTH/2, HEIGHT + 25, WIDTH, 50, wallOptions), // Floor
    Bodies.rectangle(-25, HEIGHT/2, 50, HEIGHT*2, wallOptions), // Left
    Bodies.rectangle(WIDTH + 25, HEIGHT/2, 50, HEIGHT*2, wallOptions) // Right
]);

// Physics Merge Logic
let mergesToProcess = [];

Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
        const a = pair.bodyA;
        const b = pair.bodyB;
        if (a.label === 'asset' && b.label === 'asset') {
            if (a.tier === b.tier && !a.isMerging && !b.isMerging && a.tier < ASSETS.length - 1) {
                a.isMerging = true;
                b.isMerging = true;
                mergesToProcess.push({ a, b });
            }
        }
    });
});

Events.on(engine, 'beforeUpdate', () => {
    while (mergesToProcess.length > 0) {
        const { a, b } = mergesToProcess.pop();
        // Ensure both still exist in the world
        if (Composite.allBodies(world).includes(a) && Composite.allBodies(world).includes(b)) {
            const nextTier = a.tier + 1;
            const midX = (a.position.x + b.position.x) / 2;
            const midY = (a.position.y + b.position.y) / 2;
            
            Composite.remove(world, [a, b]);
            
            const newBody = createAsset(midX, midY, nextTier);
            Composite.add(world, newBody);
            
            state.score += ASSETS[nextTier].score;
            updateHUD();
            if (navigator.vibrate) navigator.vibrate(20);
        }
    }
});

// Game Over Logic
Events.on(engine, 'afterUpdate', () => {
    if (!state.isPlaying) return;
    
    let danger = false;
    let overLine = false;
    
    for (let body of Composite.allBodies(world)) {
        if (body.label === 'asset' && !body.isDropping) {
            if (body.position.y - body.circleRadius < 150) danger = true;
            if (body.position.y - body.circleRadius < 80 && body.velocity.y < 0.5 && body.velocity.x < 0.5) {
                overLine = true;
            }
        }
    }
    
    if (danger) dangerLine.classList.add('alert');
    else dangerLine.classList.remove('alert');
    
    if (overLine) {
        state.gameOverTimer++;
        if (state.gameOverTimer > 120) { // approx 2 seconds resting above line
            gameOver();
        }
    } else {
        state.gameOverTimer = 0;
    }
});

function createAsset(x, y, tier, isDropping = false) {
    const a = ASSETS[tier];
    const body = Bodies.circle(x, y, a.r, {
        label: 'asset',
        tier: tier,
        restitution: 0.3,
        friction: 0.5,
        density: 0.05,
        isDropping: isDropping,
        isStatic: isDropping // Keep static while aiming
    });
    return body;
}

function updateHUD() {
    scoreEl.textContent = '$' + state.score;
    nextEl.textContent = ASSETS[state.nextTier].emoji;
}

function rollNext() {
    // Only spawn tiers 0-3 initially
    state.nextTier = Math.floor(Math.random() * 4);
    updateHUD();
}

function handleInput(x) {
    if (!state.isPlaying || !state.canDrop) return;
    // Map client X to internal canvas coords
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    let canvasX = (x - rect.left) * scaleX;
    
    const r = ASSETS[state.nextTier].r;
    // Clamp to walls
    if (canvasX < r + 5) canvasX = r + 5;
    if (canvasX > WIDTH - r - 5) canvasX = WIDTH - r - 5;
    
    state.dropX = canvasX;
}

function drop() {
    if (!state.isPlaying || !state.canDrop) return;
    state.canDrop = false;
    
    const body = createAsset(state.dropX, 40, state.nextTier, false);
    Composite.add(world, body);
    
    rollNext();
    if (navigator.vibrate) navigator.vibrate(10);
    
    setTimeout(() => { state.canDrop = true; }, 1000); // 1s cooldown
}

// Event Listeners
canvas.addEventListener('mousemove', (e) => handleInput(e.clientX));
canvas.addEventListener('touchmove', (e) => handleInput(e.touches[0].clientX), {passive: true});
canvas.addEventListener('click', drop);
canvas.addEventListener('touchend', (e) => { e.preventDefault(); drop(); }, {passive: false});

// Custom Render Loop
function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // Draw Danger Zone
    ctx.fillStyle = 'rgba(251, 113, 133, 0.05)';
    ctx.fillRect(0, 0, WIDTH, 100);

    // Draw active dropper ghost
    if (state.isPlaying && state.canDrop) {
        const a = ASSETS[state.nextTier];
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(state.dropX, 40, a.r, 0, Math.PI*2);
        ctx.fillStyle = a.color;
        ctx.fill();
        
        // Draw drop line
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.setLineDash([5, 10]);
        ctx.beginPath();
        ctx.moveTo(state.dropX, 40 + a.r);
        ctx.lineTo(state.dropX, HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.globalAlpha = 1.0;
        ctx.font = `${a.r * 1.2}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(a.emoji, state.dropX, 40);
    }
    
    // Draw bodies
    const bodies = Composite.allBodies(world);
    for (let body of bodies) {
        if (body.label === 'asset') {
            const a = ASSETS[body.tier];
            ctx.save();
            ctx.translate(body.position.x, body.position.y);
            ctx.rotate(body.angle);
            
            // Draw circle
            ctx.beginPath();
            ctx.arc(0, 0, a.r, 0, Math.PI*2);
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, a.r);
            grad.addColorStop(0, a.color);
            grad.addColorStop(1, '#050A12');
            ctx.fillStyle = grad;
            ctx.fill();
            
            ctx.lineWidth = 2;
            ctx.strokeStyle = a.color;
            ctx.stroke();
            
            // Draw Emoji
            ctx.font = `${a.r * 1.1}px sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.fillText(a.emoji, 0, 2);
            ctx.shadowBlur = 0;
            
            ctx.restore();
        }
    }
    
    requestAnimationFrame(draw);
}

function startGame() {
    // Clear world
    Composite.allBodies(world).forEach(body => {
        if (body.label === 'asset') Composite.remove(world, body);
    });
    
    state.score = 0;
    state.gameOverTimer = 0;
    state.isPlaying = true;
    state.canDrop = true;
    rollNext();
    updateHUD();
    modal.classList.remove('active');
    dangerLine.classList.remove('alert');
}

function gameOver() {
    state.isPlaying = false;
    modal.classList.add('active');
    document.getElementById('modal-title').textContent = "Market Crash!";
    document.getElementById('modal-title').style.color = "var(--mb-red)";
    document.getElementById('modal-desc').innerHTML = `Your portfolio overflowed the vault.<br><br>Final Net Worth: <b>$${state.score}</b>`;
    document.getElementById('modal-btn').textContent = "TRY AGAIN";
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

document.getElementById('modal-btn').addEventListener('click', startGame);

// Start engine and render loop
Runner.run(Runner.create(), engine);
requestAnimationFrame(draw);
