const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

const localIP = getLocalIP();
const joinUrl = `http://${localIP}:${PORT}/player.html`;

app.use(express.static('public'));

// Game State
let gameState = {
    phase: 'lobby', // lobby, board, clue_reading, answering, feedback
    players: {}, 
    playedCells: [],
    dailyDoubles: [],
    boardControl: null, 
    activeQuestion: null,
    wagerAmount: 0,
    activeBuzzer: null, 
    hostLog: ["Welcome to MONEY GLITCH. Waiting for players..."],
    joinUrl: joinUrl
};

function generateDailyDoubles() {
    gameState.dailyDoubles = [];
    while(gameState.dailyDoubles.length < 2) {
        let r = Math.floor(Math.random() * 30);
        if(!gameState.dailyDoubles.includes(r)) gameState.dailyDoubles.push(r);
    }
}

function broadcastState() {
    io.emit('state_update', gameState);
}

function addLog(msg) {
    gameState.hostLog.push(msg);
    if(gameState.hostLog.length > 8) gameState.hostLog.shift();
    broadcastState();
}

io.on('connection', (socket) => {
    // Host commands
    socket.on('start_game', () => {
        generateDailyDoubles();
        gameState.phase = 'board';
        gameState.playedCells = [];
        
        // Give control to random player
        const playerIds = Object.keys(gameState.players);
        if(playerIds.length > 0) gameState.boardControl = playerIds[Math.floor(Math.random() * playerIds.length)];
        
        addLog("Game Started! The board is live.");
        broadcastState();
    });

    socket.on('select_cell', (data) => {
        gameState.activeQuestion = data.questionData;
        gameState.activeQuestion.cellIndex = data.cellIndex;
        gameState.wagerAmount = 0; // CRITICAL: Reset wager from previous question
        
        // Reset locks
        Object.keys(gameState.players).forEach(id => gameState.players[id].locked = false);
        gameState.activeBuzzer = null;

        if (data.isDD) {
            gameState.phase = 'wager';
            gameState.activeBuzzer = gameState.boardControl;
            addLog(`MONEY GLITCH! ${gameState.players[gameState.boardControl]?.name || 'Player'} must wager.`);
        } else {
            gameState.phase = 'clue_reading';
            addLog(`Clue selected for $${data.questionData.value}.`);
        }
        broadcastState();
    });

    socket.on('host_pass', () => {
        gameState.phase = 'feedback';
        addLog(`Nobody knew the answer! Correct answer: option ${gameState.activeQuestion.answer + 1}.`);
        broadcastState();
    });

    socket.on('close_clue', () => {
        gameState.phase = 'board';
        gameState.playedCells.push(gameState.activeQuestion.cellIndex);
        gameState.activeQuestion = null;
        gameState.activeBuzzer = null;
        broadcastState();
    });

    socket.on('reset_game', () => {
        // Full hard reset of all game state variables
        gameState.players = {};
        gameState.phase = 'lobby';
        gameState.playedCells = [];
        gameState.activeQuestion = null;
        gameState.boardControl = null;
        gameState.wagerAmount = 0;
        gameState.activeBuzzer = null;
        gameState.hostLog = ["System reset. Waiting for players..."];
        broadcastState();
        
        // Force all connected clients to reload their page
        io.emit('force_reload');
    });

    // Player commands
    socket.on('join_game', (name) => {
        if(gameState.phase !== 'lobby') {
            socket.emit('error', 'Game already in progress');
            return;
        }
        gameState.players[socket.id] = {
            id: socket.id,
            name: name,
            score: 0,
            locked: false
        };
        addLog(`${name} joined the game.`);
        broadcastState();
    });

    socket.on('submit_wager', (amount) => {
        if(socket.id !== gameState.activeBuzzer || gameState.phase !== 'wager') return;
        gameState.wagerAmount = amount;
        gameState.phase = 'answering'; 
        addLog(`${gameState.players[socket.id].name} wagered $${amount}.`);
        broadcastState();
    });

    socket.on('buzz_in', () => {
        if(gameState.phase !== 'clue_reading') return;
        if(gameState.players[socket.id].locked) return;

        gameState.activeBuzzer = socket.id;
        gameState.phase = 'answering';
        addLog(`${gameState.players[socket.id].name} buzzed in!`);
        broadcastState();
    });

    socket.on('submit_answer', (answerIndex) => {
        if(socket.id !== gameState.activeBuzzer || gameState.phase !== 'answering') return;

        const player = gameState.players[socket.id];
        const isCorrect = (answerIndex === gameState.activeQuestion.answer);

        let value = gameState.wagerAmount || gameState.activeQuestion.value;

        if (isCorrect) {
            player.score += value;
            gameState.boardControl = socket.id;
            gameState.phase = 'feedback';
            addLog(`CORRECT! ${player.name} earns $${value}.`);
            io.emit('play_sound', 'correct');
        } else {
            player.score -= value;
            addLog(`INCORRECT! ${player.name} loses $${value}.`);
            
            player.locked = true;
            io.emit('play_sound', 'wrong');

            // Are there other unlocked players?
            const unlockedPlayers = Object.values(gameState.players).filter(p => !p.locked);
            if(unlockedPlayers.length > 0 && !gameState.activeQuestion.isDD) {
                gameState.phase = 'clue_reading';
                gameState.activeBuzzer = null;
                addLog(`Clue is open for steals!`);
            } else {
                gameState.phase = 'feedback';
                addLog(`Clue closed.`);
            }
        }
        broadcastState();
    });

    socket.on('disconnect', () => {
        if(gameState.players[socket.id]) {
            addLog(`${gameState.players[socket.id].name} left the game.`);
            delete gameState.players[socket.id];
            broadcastState();
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});