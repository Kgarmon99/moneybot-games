const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-display');
const timeEl = document.getElementById('time-display');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalBtn = document.getElementById('modal-btn');
const particlesEl = document.getElementById('particles');

// Game State
let state = {
    isPlaying: false,
    cash: 0,
    time: 120, // 2 minutes
    lastTick: 0,
    frames: 0,
    
    // Layout zones
    zones: {},
    
    grill: [null, null, null, null], // 4 slots
    plates: [null, null, null, null], // 4 plates
    customers: [],
    
    // Particle text
    popTexts: []
};

// Item definitions
const ITEMS = {
    RAW_TBILL: { id: 'tbill', name: 'Bond', emoji: '📄', cooked: '💵', color: '#69F0AE', cookTime: 3, burnTime: 8, price: 20 },
    RAW_CHIP: { id: 'chip', name: 'Stock', emoji: '🏢', cooked: '📈', color: '#FCD34D', cookTime: 5, burnTime: 12, price: 50 },
    FOLDER: { id: 'folder', name: 'Folder', emoji: '📁', filled: '💼', color: '#38BDF8' }
};

function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    calculateZones();
}
window.addEventListener('resize', resize);

function calculateZones() {
    const w = canvas.width;
    const h = canvas.height;
    
    state.zones = {
        customers: { x: 0, y: 0, w: w, h: h * 0.35 },
        grillArea: { x: w * 0.2, y: h * 0.35, w: w * 0.6, h: h * 0.3 },
        prepArea: { x: 0, y: h * 0.65, w: w, h: h * 0.35 },
        
        // Buttons
        btnTBill: { x: 20, y: h * 0.4, w: 80, h: 60 },
        btnChip: { x: 20, y: h * 0.5, w: 80, h: 60 },
        btnFolder: { x: 20, y: h * 0.7, w: 80, h: 80 },
        trash: { x: w - 90, y: h * 0.7, w: 80, h: 80 },
        
        // Grill slots (calculated in draw)
        // Plates (calculated in draw)
    };
}

function spawnText(x, y, text, color = '#00E676') {
    state.popTexts.push({ x, y, text, color, life: 1.0 });
}

function spawnCustomer() {
    if (state.customers.length >= 3) return;
    
    // Randomize order
    const numItems = Math.floor(Math.random() * 2) + 1;
    const order = [];
    for(let i=0; i<numItems; i++) {
        order.push(Math.random() > 0.4 ? 'tbill' : 'chip');
    }
    
    state.customers.push({
        id: Math.random(),
        patience: 1.0, // 100% to 0%
        order: order,
        maxWait: 30 + (Math.random() * 15) // seconds
    });
}

// Input Handling
function handleClick(e) {
    if (!state.isPlaying) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    // Check Supply Buttons
    if (isInside(x, y, state.zones.btnTBill)) addRawToGrill(ITEMS.RAW_TBILL);
    else if (isInside(x, y, state.zones.btnChip)) addRawToGrill(ITEMS.RAW_CHIP);
    else if (isInside(x, y, state.zones.btnFolder)) addFolderToPlate();
    
    // Check Grill Slots
    for (let i = 0; i < 4; i++) {
        const slotRect = getGrillSlotRect(i);
        if (isInside(x, y, slotRect)) handleGrillClick(i);
    }
    
    // Check Plates
    for (let i = 0; i < 4; i++) {
        const plateRect = getPlateRect(i);
        if (isInside(x, y, plateRect)) handlePlateClick(i);
    }
}

canvas.addEventListener('mousedown', handleClick);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleClick(e); }, {passive: false});

function isInside(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function getGrillSlotRect(i) {
    const z = state.zones.grillArea;
    const w = 70, h = 50;
    const spacing = (z.w - (4 * w)) / 5;
    return { x: z.x + spacing + (i * (w + spacing)), y: z.y + z.h/2 - h/2, w, h };
}

function getPlateRect(i) {
    const z = state.zones.prepArea;
    const w = 80, h = 60;
    const startX = (canvas.width / 2) - (2 * w) - 20;
    return { x: startX + (i * (w + 10)), y: z.y + 40, w, h };
}

// Interactions
function addRawToGrill(itemDef) {
    const idx = state.grill.findIndex(slot => slot === null);
    if (idx !== -1) {
        state.grill[idx] = { type: itemDef.id, timeCooked: 0, state: 'cooking', def: itemDef };
        if (navigator.vibrate) navigator.vibrate(10);
    }
}

function addFolderToPlate() {
    const idx = state.plates.findIndex(p => p === null);
    if (idx !== -1) {
        state.plates[idx] = { state: 'empty_folder' };
        if (navigator.vibrate) navigator.vibrate(10);
    }
}

function handleGrillClick(i) {
    const slot = state.grill[i];
    if (!slot) return;
    
    if (slot.state === 'burned') {
        // Trash it
        state.grill[i] = null;
        spawnText(getGrillSlotRect(i).x, getGrillSlotRect(i).y, "Trashed", "#FB7185");
        return;
    }
    
    if (slot.state === 'cooked') {
        // Try to move to a folder
        const pIdx = state.plates.findIndex(p => p !== null && p.state === 'empty_folder');
        if (pIdx !== -1) {
            state.plates[pIdx] = { state: 'filled', type: slot.type, def: slot.def };
            state.grill[i] = null; // Clear grill
            if (navigator.vibrate) navigator.vibrate(10);
        } else {
            spawnText(getGrillSlotRect(i).x, getGrillSlotRect(i).y - 20, "Need Folder!", "#FB7185");
        }
    }
}

function handlePlateClick(i) {
    const plate = state.plates[i];
    if (!plate) return;
    
    // If it's just an empty folder and we click it, maybe we want to trash it? Let's just leave it.
    if (plate.state === 'filled') {
        // Try to serve to a customer
        let served = false;
        
        // Find first customer who needs this item
        for (let c of state.customers) {
            const needIdx = c.order.indexOf(plate.type);
            if (needIdx !== -1) {
                // Serve!
                c.order.splice(needIdx, 1);
                state.cash += plate.def.price;
                spawnText(canvas.width/2, canvas.height/4, `+$${plate.def.price}`);
                state.plates[i] = null; // Clear plate
                served = true;
                if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
                
                // Did customer finish?
                if (c.order.length === 0) {
                    // Tip based on patience
                    const tip = Math.floor(c.patience * 15);
                    if (tip > 0) {
                        state.cash += tip;
                        spawnText(canvas.width/2 + 50, canvas.height/4 - 20, `+$${tip} Tip!`, "#FBBF24");
                    }
                    state.customers = state.customers.filter(cust => cust.id !== c.id); // Remove
                }
                break; // Only serve one item per click
            }
        }
        
        if (!served) {
            // Trash the mistake
            state.plates[i] = null;
            spawnText(getPlateRect(i).x, getPlateRect(i).y, "Trashed", "#FB7185");
        }
    }
}

// Loop
function update(dt) {
    state.time -= dt;
    if (state.time <= 0) {
        gameOver();
        return;
    }
    
    // Update Grill
    state.grill.forEach((slot, i) => {
        if (slot) {
            slot.timeCooked += dt;
            if (slot.state === 'cooking' && slot.timeCooked >= slot.def.cookTime) {
                slot.state = 'cooked';
            } else if (slot.state === 'cooked' && slot.timeCooked >= slot.def.burnTime) {
                slot.state = 'burned';
            }
        }
    });
    
    // Update Customers
    state.customers.forEach(c => {
        c.patience -= dt / c.maxWait;
    });
    // Remove angry customers
    const beforeLen = state.customers.length;
    state.customers = state.customers.filter(c => c.patience > 0);
    if (state.customers.length < beforeLen) {
        spawnText(canvas.width/2, 100, "Lost Client!", "#FB7185");
        if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
    }
    
    // Spawn
    if (Math.random() < 0.01 * (1 + (120 - state.time)/60)) {
        spawnCustomer();
    }
    
    // Particles
    state.popTexts.forEach(p => p.life -= dt * 1.5);
    state.popTexts = state.popTexts.filter(p => p.life > 0);
    
    // HUD
    scoreEl.textContent = '$' + state.cash;
    const min = Math.floor(Math.max(0, state.time) / 60);
    const sec = Math.floor(Math.max(0, state.time) % 60);
    timeEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#060E1A';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    // Draw Counter/Wall
    ctx.fillStyle = '#0A1526';
    ctx.fillRect(0, state.zones.customers.h, canvas.width, canvas.height - state.zones.customers.h);
    
    // Draw Grill Background (Yield Engine)
    const gz = state.zones.grillArea;
    
    // Engine Glow
    const engineGrad = ctx.createLinearGradient(gz.x, gz.y, gz.x, gz.y + gz.h);
    engineGrad.addColorStop(0, '#0F1E36');
    engineGrad.addColorStop(1, '#050A12');
    ctx.fillStyle = engineGrad;
    ctx.beginPath(); ctx.roundRect(gz.x, gz.y, gz.w, gz.h, 16); ctx.fill();
    
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Laser grid
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.1)';
    ctx.lineWidth = 1;
    for(let i=10; i<gz.w; i+= 20) {
        ctx.beginPath(); ctx.moveTo(gz.x + i, gz.y + 10); ctx.lineTo(gz.x + i, gz.y + gz.h - 10); ctx.stroke();
    }
    for(let i=10; i<gz.h; i+= 20) {
        ctx.beginPath(); ctx.moveTo(gz.x + 10, gz.y + i); ctx.lineTo(gz.x + gz.w - 10, gz.y + i); ctx.stroke();
    }
    
    // Engine Label
    ctx.fillStyle = 'rgba(0, 230, 118, 0.5)';
    ctx.font = 'bold 12px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("YIELD ENGINE v2.0", gz.x + gz.w/2, gz.y - 10);
    
    // Draw Buttons (Supply)
    drawButton(state.zones.btnTBill, ITEMS.RAW_TBILL.color, "📄", "BOND");
    drawButton(state.zones.btnChip, ITEMS.RAW_CHIP.color, "🏢", "STOCK");
    drawButton(state.zones.btnFolder, ITEMS.FOLDER.color, "📁", "FOLDER");
    
    // Draw Trash
    drawButton(state.zones.trash, '#FB7185', "🗑️", "TRASH");

    // Draw Grill Slots
    state.grill.forEach((slot, i) => {
        const r = getGrillSlotRect(i);
        
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.strokeStyle = 'rgba(0, 230, 118, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 8); 
        ctx.fill(); ctx.stroke();
        
        if (slot) {
            drawItem(r.x + r.w/2, r.y + r.h/2 + 5, slot);
            
            // Progress bar
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.beginPath(); ctx.roundRect(r.x, r.y - 12, r.w, 6, 3); ctx.fill();
            
            if (slot.state === 'cooking') {
                ctx.fillStyle = '#FBBF24';
                ctx.shadowBlur = 5; ctx.shadowColor = '#FBBF24';
                ctx.beginPath(); ctx.roundRect(r.x, r.y - 12, Math.max(4, r.w * (slot.timeCooked / slot.def.cookTime)), 6, 3); ctx.fill();
                ctx.shadowBlur = 0;
            } else if (slot.state === 'cooked') {
                ctx.fillStyle = '#00E676';
                ctx.shadowBlur = 5; ctx.shadowColor = '#00E676';
                ctx.beginPath(); ctx.roundRect(r.x, r.y - 12, r.w, 6, 3); ctx.fill();
                ctx.shadowBlur = 0;
                
                // Burn warning overlay
                const burnPct = (slot.timeCooked - slot.def.cookTime) / (slot.def.burnTime - slot.def.cookTime);
                ctx.fillStyle = '#FB7185';
                ctx.shadowBlur = 10; ctx.shadowColor = '#FB7185';
                ctx.beginPath(); ctx.roundRect(r.x, r.y - 12, r.w * Math.min(1, burnPct), 6, 3); ctx.fill();
                ctx.shadowBlur = 0;
                
                // Alert flash if near burn
                if (burnPct > 0.7 && state.frames % 20 < 10) {
                    ctx.fillStyle = 'rgba(251, 113, 133, 0.3)';
                    ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 8); ctx.fill();
                }
            }
        }
    });
    
    // Draw Plates (Assembly Line)
    state.plates.forEach((plate, i) => {
        const r = getPlateRect(i);
        
        ctx.fillStyle = 'rgba(10, 24, 42, 0.6)';
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.ellipse(r.x + r.w/2, r.y + r.h/2, r.w/2, r.h/4, 0, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
        
        if (plate) {
            if (plate.state === 'empty_folder') {
                drawEmoji(r.x + r.w/2, r.y + r.h/2 + 5, ITEMS.FOLDER.emoji, 40);
            } else if (plate.state === 'filled') {
                drawEmoji(r.x + r.w/2, r.y + r.h/2 + 5, ITEMS.FOLDER.filled, 46);
                // Draw tiny icon of what's inside
                drawEmoji(r.x + r.w/2 + 15, r.y + r.h/2 - 10, plate.def.cooked, 20);
            }
        }
    });
    
    // Draw Customers
    const cw = canvas.width / 3;
    const avatars = ['🤖', '👾', '👽', '🤑', '🧐'];
    
    state.customers.forEach((c, i) => {
        const cx = i * cw + (cw/2);
        const cy = state.zones.customers.h - 40;
        
        // Avatar
        const avatarIdx = Math.floor(c.id * avatars.length);
        drawEmoji(cx, cy, avatars[avatarIdx], 60);
        
        // Patience Bar
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath(); ctx.roundRect(cx - 30, cy - 45, 60, 6, 3); ctx.fill();
        
        const patColor = c.patience > 0.5 ? '#00E676' : (c.patience > 0.25 ? '#FBBF24' : '#FB7185');
        ctx.fillStyle = patColor;
        ctx.shadowBlur = 5; ctx.shadowColor = patColor;
        ctx.beginPath(); ctx.roundRect(cx - 30, cy - 45, 60 * c.patience, 6, 3); ctx.fill();
        ctx.shadowBlur = 0;
        
        // Order Bubble
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.roundRect(cx - 50, cy - 110, Math.max(100, c.order.length * 40 + 20), 50, 12);
        ctx.fill();
        
        // Bubble tail
        ctx.beginPath();
        ctx.moveTo(cx, cy - 60);
        ctx.lineTo(cx - 10, cy - 70);
        ctx.lineTo(cx + 10, cy - 70);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Order Items
        c.order.forEach((type, idx) => {
            const ix = cx - 40 + (idx * 40);
            const iy = cy - 100;
            const def = Object.values(ITEMS).find(d => d.id === type);
            
            // Draw portfolio outline
            drawEmoji(ix + 15, iy + 15, ITEMS.FOLDER.emoji, 30);
            // Draw needed asset inside
            drawEmoji(ix + 15, iy + 15, def.cooked, 16);
        });
    });
    
    // Particles
    state.popTexts.forEach(p => {
        ctx.fillStyle = `rgba(0,0,0,${p.life})`;
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x + 2, p.y - (1-p.life)*40 + 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillText(p.text, p.x, p.y - (1-p.life)*40);
        ctx.globalAlpha = 1.0;
    });
}

function drawButton(rect, color, emoji, text) {
    ctx.fillStyle = 'rgba(10, 24, 42, 0.8)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 12); 
    ctx.fill(); ctx.stroke();
    
    // Inner glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.roundRect(rect.x+2, rect.y+2, rect.w-4, rect.h-4, 10); ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, rect.x + rect.w/2, rect.y + rect.h/2 - 5);
    
    ctx.fillStyle = color;
    ctx.font = 'bold 10px "Inter", sans-serif';
    ctx.fillText(text, rect.x + rect.w/2, rect.y + rect.h - 12);
}

function drawEmoji(x, y, emoji, size) {
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Small drop shadow for emojis
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.fillText(emoji, x, y);
    ctx.shadowBlur = 0;
}

function drawItem(x, y, slot) {
    let emoji = slot.def.emoji;
    
    if (slot.state === 'cooked') {
        emoji = slot.def.cooked;
    } else if (slot.state === 'burned') {
        emoji = '🔥';
    }
    
    drawEmoji(x, y, emoji, 36);
}

function gameLoop(now) {
    if (!state.isPlaying) return;
    
    const dt = (now - state.lastTick) / 1000;
    state.lastTick = now;
    
    update(dt);
    if(state.isPlaying) draw();
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    resize();
    state = {
        isPlaying: true,
        cash: 0,
        time: 120,
        lastTick: performance.now(),
        frames: 0,
        zones: state.zones,
        grill: [null, null, null, null],
        plates: [null, null, null, null],
        customers: [],
        popTexts: []
    };
    modal.classList.remove('active');
    spawnCustomer();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    state.isPlaying = false;
    modal.classList.add('active');
    modalTitle.textContent = "Market Closed!";
    modalTitle.style.color = "var(--mb-white)";
    modalDesc.innerHTML = `Great shift! You generated <b>$${state.cash}</b> in yield today.`;
    modalBtn.textContent = "PLAY AGAIN";
}

modalBtn.addEventListener('click', startGame);
modalBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startGame(); }, {passive: false});

// Init draw
resize();
draw();