import { Game } from './modules/Game.js';
import { renderGameOverlay } from './render/gameOverlay.js';
// Hämta UI-element
const overlay = renderGameOverlay();

const ui = {
    boardEl: document.querySelector('#board'),
    scoreEl: document.querySelector('#score'),
    timeEl: document.querySelector('#time'),
    missesEl: document.querySelector('#misses'),
    startBtn: document.querySelector('#startBtn'),
    resetBtn: document.querySelector('#resetBtn'),
    pauseBtn: document.querySelector('#pauseBtn'),
    gameOverLay: overlay,
    playAgainBtn: document.getElementById('playAgainBtn'),
    gameOverMessage: document.getElementById('gameOverMessage')
};
const game = new Game(ui);
game.init(); // Skapar bräde, binder events
ui.startBtn.addEventListener('click', () => game.start());
ui.resetBtn.addEventListener('click', () => game.reset());
ui.pauseBtn.addEventListener('click', () => {
    if (game.state.running) {
        game.pause();
    } else {
        game.resume();
    }
});
ui.playAgainBtn.addEventListener('click', () => {
    game.reset();
});