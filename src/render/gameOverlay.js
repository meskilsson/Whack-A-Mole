
export function renderGameOverlay() {

    const playAgainBtn = document.getElementById('playAgainBtn');

    const gameOverlay = document.createElement('div');

    gameOverlay.className = 'overlay';
    gameOverlay.setAttribute('aria-hidden', 'true');

    const overlayContent = document.createElement('div');
    overlayContent.className = 'overlay-content';
    overlayContent.setAttribute('role', 'dialog');
    overlayContent.setAttribute('aria-modal', 'true');
    overlayContent.setAttribute('aria-labelledby', 'gameOverTitle');

    const gameOver = document.createElement('h2');
    gameOver.id = 'gameOverTitle';
    gameOver.textContent = 'Spelet är över!';

    const gameOverMsg = document.createElement('p');
    gameOverMsg.id = 'gameOverMessage';
    gameOverMsg.textContent = 'Din poäng: 0';


    overlayContent.appendChild(gameOver);
    overlayContent.appendChild(gameOverMsg);
    overlayContent.appendChild(playAgainBtn);
    gameOverlay.appendChild(overlayContent);
    document.body.appendChild(gameOverlay);

    return gameOverlay;
}
