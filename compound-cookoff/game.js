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
    RAW_TBILL: { id: 'tbill', name: 'T-Bill', color: '#69F0AE', cookTime: 3, burnTime: 8, price: 20 },
    RAW_CHIP: { id: 'chip', name: 'Blue Chip', color: '#FCD34D', cookTime: 5, burnTime: 12, price: 50 },
    FOLDER: { id: 'folder', name: 'Folder', color: '#38BDF8' }
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
    
    // Draw Grill Background
    const gz = state.zones.grillArea;
    ctx.fillStyle = '#111';
    ctx.fillRect(gz.x, gz.y, gz.w, gz.h);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    for(let i=0; i<gz.w; i+= 15) {
        ctx.beginPath(); ctx.moveTo(gz.x + i, gz.y); ctx.lineTo(gz.x + i, gz.y + gz.h); ctx.stroke();
    }
    
    // Draw Buttons (Supply)
    drawButton(state.zones.btnTBill, ITEMS.RAW_TBILL.color, "T-Bill");
    drawButton(state.zones.btnChip, ITEMS.RAW_CHIP.color, "Blue Chip");
    drawButton(state.zones.btnFolder, ITEMS.FOLDER.color, "Folder");
    
    // Draw Trash
    drawButton(state.zones.trash, '#FB7185', "Trash");

    // Draw Grill Slots
    state.grill.forEach((slot, i) => {
        const r = getGrillSlotRect(i);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        
        if (slot) {
            drawItem(r.x + 5, r.y + 5, r.w - 10, r.h - 10, slot);
            
            // Progress bar
            ctx.fillStyle = '#000';
            ctx.fillRect(r.x, r.y - 10, r.w, 6);
            if (slot.state === 'cooking') {
                ctx.fillStyle = '#FBBF24';
                ctx.fillRect(r.x, r.y - 10, r.w * (slot.timeCooked / slot.def.cookTime), 6);
            } else if (slot.state === 'cooked') {
                ctx.fillStyle = '#00E676';
                ctx.fillRect(r.x, r.y - 10, r.w, 6);
                // Burn warning
                const burnPct = (slot.timeCooked - slot.def.cookTime) / (slot.def.burnTime - slot.def.cookTime);
                ctx.fillStyle = '#FB7185';
                ctx.fillRect(r.x, r.y - 10, r.w * burnPct, 6);
            }
        }
    });
    
    // Draw Plates
    state.plates.forEach((plate, i) => {
        const r = getPlateRect(i);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.ellipse(r.x + r.w/2, r.y + r.h/2, r.w/2, r.h/4, 0, 0, Math.PI*2);
        ctx.fill();
        
        if (plate) {
            if (plate.state === 'empty_folder') {
                ctx.fillStyle = ITEMS.FOLDER.color;
                ctx.fillRect(r.x + 10, r.y + 5, r.w - 20, r.h - 10);
            } else if (plate.state === 'filled') {
                ctx.fillStyle = ITEMS.FOLDER.color;
                ctx.fillRect(r.x + 10, r.y + 5, r.w - 20, r.h - 10);
                drawItem(r.x + 15, r.y + 10, r.w - 30, r.h - 20, { type: plate.type, state: 'cooked', def: plate.def });
            }
        }
    });
    
    // Draw Customers
    const cw = canvas.width / 3;
    state.customers.forEach((c, i) => {
        const cx = i * cw + (cw/2);
        const cy = state.zones.customers.h - 50;
        
        // Body
        ctx.fillStyle = `hsl(${(c.id * 360) % 360}, 60%, 60%)`;
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI*2);
        ctx.fill();
        
        // Patience Bar
        ctx.fillStyle = '#000';
        ctx.fillRect(cx - 30, cy - 45, 60, 6);
        ctx.fillStyle = c.patience > 0.5 ? '#00E676' : (c.patience > 0.25 ? '#FBBF24' : '#FB7185');
        ctx.fillRect(cx - 30, cy - 45, 60 * c.patience, 6);
        
        // Order Bubble
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.roundRect(cx - 50, cy - 110, Math.max(100, c.order.length * 40 + 20), 50, 10);
        ctx.fill();
        
        // Order Items
        c.order.forEach((type, idx) => {
            const ix = cx - 40 + (idx * 40);
            const iy = cy - 100;
            const def = Object.values(ITEMS).find(d => d.id === type);
            ctx.fillStyle = ITEMS.FOLDER.color;
            ctx.fillRect(ix, iy, 30, 30);
            drawItem(ix+2, iy+2, 26, 26, { type: type, state: 'cooked', def: def });
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

function drawButton(rect, color, text) {
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.beginPath(); ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 8); ctx.fill();
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, rect.x + rect.w/2, rect.y + rect.h/2);
}

function drawItem(x, y, w, h, slot) {
    let color = slot.def.color;
    if (slot.state === 'cooked') {
        // Darker
        color = slot.type === 'tbill' ? '#00C853' : '#F59E0B';
    } else if (slot.state === 'burned') {
        color = '#333';
    }
    
    ctx.fillStyle = color;
    if (slot.type === 'tbill') {
        ctx.fillRect(x, y, w, h); // Rect
    } else {
        ctx.beginPath(); ctx.arc(x + w/2, y + h/2, w/2, 0, Math.PI*2); ctx.fill(); // Circle
    }
    
    if (slot.state === 'burned') {
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("X", x + w/2, y + h/2 + 4);
    }
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