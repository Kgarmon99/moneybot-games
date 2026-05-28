# Money Glitch: Reality Check

A multiplayer, real-time financial literacy game show built with Node.js and Socket.io.

## Features
- **Host Screen**: 3D flip animations, real-time scoreboard, AI Broker terminal logs, and a QR code lobby.
- **Player Buzzers**: Players join via smartphones. Fastest finger locks out the competition.
- **Custom Boards**: Update the questions by editing `public/game-data.js`.

## Local Development
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm start` (or `node server.js`) to launch the server.
4. Open `http://localhost:3000/host.html` on your main screen.
5. Have players scan the QR code to join via their phones.

## Deployment
This game requires a Node.js server. It cannot be hosted on static sites like GitHub Pages. 
Deploy easily using platforms like [Render](https://render.com), [Railway](https://railway.app), or [Glitch](https://glitch.com).