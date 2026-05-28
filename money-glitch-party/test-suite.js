const { io } = require("socket.io-client");
const assert = require("assert");

const HOST_URL = "http://localhost:3000";

async function runTests() {
    console.log("Starting automated game flow test...");
    
    // 1. Connect Host and 2 Players
    const hostSocket = io(HOST_URL);
    const p1Socket = io(HOST_URL);
    const p2Socket = io(HOST_URL);

    await new Promise(r => setTimeout(r, 500));

    let currentState = null;
    hostSocket.on('state_update', (state) => {
        currentState = state;
    });

    // Request initial state
    hostSocket.emit('join_game', 'HostObserver'); // Just to trigger a state broadcast
    await new Promise(r => setTimeout(r, 500));
    
    // Now Players Join
    p1Socket.emit('join_game', 'Alice');
    p2Socket.emit('join_game', 'Bob');

    await new Promise(r => setTimeout(r, 500));
    
    try {
        const playerIds = Object.keys(currentState.players).filter(id => currentState.players[id].name !== 'HostObserver');
        assert.strictEqual(playerIds.length, 2, "Lobby should have 2 players");
        assert.strictEqual(currentState.phase, "lobby", "Game should start in lobby phase");
        console.log("✅ Lobby logic working.");

        // 3. Host Starts Game
        hostSocket.emit('start_game');
        await new Promise(r => setTimeout(r, 500));
        assert.strictEqual(currentState.phase, "board", "Phase should be 'board'");
        assert.ok(currentState.boardControl, "A player should have board control");
        console.log("✅ Game start logic working.");

        // 4. Host Selects a normal cell
        hostSocket.emit('select_cell', { 
            cellIndex: 0, 
            isDD: false, 
            questionData: { value: 200, answer: 1, prompt: "Test Q" } 
        });
        await new Promise(r => setTimeout(r, 500));
        assert.strictEqual(currentState.phase, "clue_reading", "Phase should be 'clue_reading'");
        console.log("✅ Clue selection working.");

        // 5. P1 Buzzes in
        p1Socket.emit('buzz_in');
        await new Promise(r => setTimeout(r, 500));
        assert.strictEqual(currentState.phase, "answering", "Phase should be 'answering'");
        assert.strictEqual(currentState.activeBuzzer, p1Socket.id, "P1 should be the active buzzer");
        console.log("✅ Buzz-in logic working.");

        // 6. P1 answers incorrectly
        p1Socket.emit('submit_answer', 0); // Wrong answer (correct is 1)
        await new Promise(r => setTimeout(r, 500));
        assert.strictEqual(currentState.players[p1Socket.id].score, -200, "P1 should lose 200 points");
        assert.ok(currentState.players[p1Socket.id].locked, "P1 should be locked out");
        assert.strictEqual(currentState.phase, "clue_reading", "Clue should reopen for P2 to buzz");
        console.log("✅ Wrong answer penalty and lockout working.");

        // 7. P2 Buzzes in and answers correctly
        p2Socket.emit('buzz_in');
        await new Promise(r => setTimeout(r, 200));
        p2Socket.emit('submit_answer', 1); // Correct answer
        await new Promise(r => setTimeout(r, 500));
        assert.strictEqual(currentState.players[p2Socket.id].score, 200, "P2 should gain 200 points");
        assert.strictEqual(currentState.boardControl, p2Socket.id, "P2 should gain board control");
        assert.strictEqual(currentState.phase, "feedback", "Phase should move to feedback");
        console.log("✅ Correct answer logic working.");

        // 8. Host closes clue
        hostSocket.emit('close_clue');
        await new Promise(r => setTimeout(r, 500));
        assert.strictEqual(currentState.phase, "board", "Phase should return to board");
        assert.ok(currentState.playedCells.includes(0), "Cell 0 should be marked as played");
        console.log("✅ Board return working.");

        // 9. Host tests RESET nuke
        hostSocket.emit('reset_game');
        await new Promise(r => setTimeout(r, 500));
        assert.strictEqual(currentState.phase, "lobby", "Phase should return to lobby");
        
        const remainingPlayers = Object.keys(currentState.players).filter(id => currentState.players[id].name !== 'HostObserver');
        assert.strictEqual(remainingPlayers.length, 0, "Players should be wiped");
        assert.strictEqual(currentState.playedCells.length, 0, "Played cells should be empty");
        console.log("✅ Hard reset nuke working perfectly.");

        console.log("\n🚀 ALL TESTS PASSED! The server logic is flawless.");
        process.exit(0);
    } catch(e) {
        console.error("❌ TEST FAILED:", e.message);
        process.exit(1);
    }
}

runTests();
