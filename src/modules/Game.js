import { Mole } from "./Mole.js";

// Centrera eventhantering via delegering på brädet (se vecko-materialet om addEventListener & bubbling).
// TODO-markeringar lämnar utrymme för egna lösningar.
export class Game {
    constructor({ boardEl, scoreEl, timeEl, missesEl, pauseBtn, playAgainBtn, gameOverLay, gameOverMessage }) {
        this.boardEl = boardEl;
        this.scoreEl = scoreEl;
        this.timeEl = timeEl;
        this.missesEl = missesEl;
        this.gridSize = 3;
        this.duration = 60; // sekunder
        this.state = { score: 0, misses: 0, timeLeft: this.duration, running: false };
        this._tickId = null;
        this._spawnId = null;
        this._activeMoles = new Set();
        this.handleBoardClick = this.handleBoardClick.bind(this);
        this.maxSpawnDelay = 1000;
        this.minSpawnDelay = 300;
        this.maxTtl = 1000;
        this.minTtl = 400;
        this.pauseBtn = pauseBtn;
        this.gameOverLay = gameOverLay;
        this.playAgainBtn = playAgainBtn;
        this.gameOverMessage = gameOverMessage;
    }

    init() {
        this.createGrid(this.gridSize);
        this.updateHud();

        // Eventdelegering: en lyssnare hanterar alla barn-noder.
        this.boardEl.addEventListener('click', this.handleBoardClick);
        this.boardEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ')
                e.preventDefault();
            this.handleBoardClick(e);
        });

        this.boardEl.addEventListener('keydown', (e) => {
            const cells = Array.from(this.boardEl.querySelectorAll('.cell'));
            const currentIndex = cells.indexOf(document.activeElement);

            if (currentIndex === -1) return; // Ingen cell har fokus

            let nextIndex = null;

            if (e.key === 'ArrowRight') {
                nextIndex = currentIndex + 1;
            } else if (e.key === 'ArrowLeft') {
                nextIndex = currentIndex - 1;
            } else if (e.key === 'ArrowDown') {
                nextIndex = currentIndex + this.gridSize;
            } else if (e.key === 'ArrowUp') {
                nextIndex = currentIndex - this.gridSize;
            }

            if (nextIndex !== null && cells[nextIndex]) {
                e.preventDefault(); // Hindrar sidscroll
                cells[nextIndex].focus();
            }
        });
    }

    createGrid(size = 3) {
        this.boardEl.innerHTML = '';
        for (let i = 0; i < size * size; i++) {
            const cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'cell';
            cell.setAttribute('aria-label', `Hål ${i + 1}`);
            this.boardEl.appendChild(cell);
        }
    }

    start() {
        if (this.state.running) return;
        this.state.running = true;
        this.state.score = 0;
        this.state.misses = 0;
        this.state.timeLeft = this.duration;
        this.updateHud();

        // TODO: implementera spelloop
        // 1) setInterval: nedräkning av timeLeft
        // 2) setInterval eller rekursiva setTimeout: spawn av mullvadar (variera TTL/frekvens över tid)
        this._tickId = setInterval(() => {

            this.state.timeLeft -= 1;
            this.updateHud();

            if (this.state.timeLeft === 0) {
                this.endGame();
            }
        }, 1000);

        this.nextSpawn();

    }

    endGame() {
        clearInterval(this._tickId);
        clearTimeout(this._spawnId);

        this._tickId = null;
        this._spawnId = null;

        this._activeMoles.forEach(mole => {
            mole.disappear();
        });

        this._activeMoles.clear();

        this.state.running = false;

        this.updateHud();

        this.gameOverMessage.textContent = `GAME OVER! Poäng: ${this.state.score}, Missade: ${this.state.misses}`;
        this.gameOverLay.style.display = 'flex';
        this.gameOverLay.setAttribute('aria-hidden', 'false');
        this.playAgainBtn.focus();
    }

    getSpawnDelay() {

        //Timeleft inte går under 0.
        //timeLeft är större än duration så ska faktorn aldrig bli mer än 1.
        const factor = Math.max(0, Math.min(1, this.state.timeLeft / this.duration));
        let delay = this.minSpawnDelay + (this.maxSpawnDelay - this.minSpawnDelay) * factor;

        return delay;
    }

    getMoleTtl() {

        const factor = Math.max(0, Math.min(1, this.state.timeLeft / this.duration));
        let newTtl = this.minTtl + (this.maxTtl - this.minTtl) * factor;
        return newTtl;

    }

    nextSpawn() {
        if (!this.state.running) return;
        this._spawnId = setTimeout(() => {
            this.spawnMole();

            this.nextSpawn();
        }, this.getSpawnDelay());
    }

    reset() {
        // TODO: städa timers, ta bort aktiva mullvadar, nollställ state och UI
        // Tips: loopa this._activeMoles och kalla .disappear()
        this.state.running = false;
        if (this._tickId !== null) {
            clearInterval(this._tickId);
            this._tickId = null;
        }

        if (this._spawnId !== null) {
            clearTimeout(this._spawnId);
            this._spawnId = null;
        }




        this._activeMoles.forEach(mole => {
            mole.disappear();
        });

        this._activeMoles.clear();

        this.state.score = 0;
        this.state.misses = 0;
        this.state.timeLeft = this.duration;
        this.gameOverLay.style.display = 'none';
        this.gameOverLay.setAttribute('aria-hidden', 'true');


        this.updateHud();
    }

    pause() {

        clearInterval(this._tickId);
        clearTimeout(this._spawnId);

        this._tickId = null;
        this._spawnId = null;

        this.state.running = false;
        this.pauseBtn.textContent = "Fortsätt";

    }

    resume() {

        this.state.running = true;
        this._tickId = setInterval(() => {
            this.state.timeLeft--;
            this.updateHud();
            if (this.state.timeLeft === 0) {
                this.endGame();
            }
        }, 1000);

        this.pauseBtn.textContent = "Pausa";

        this.nextSpawn();
    }

    spawnMole() {
        if (this.state.running === false) return;

        const emptyCells = [...this.boardEl.querySelectorAll('.cell:not(.has-mole)')];
        if (emptyCells.length === 0) return;
        const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const mole = new Mole(cell, this.getMoleTtl());
        this._activeMoles.add(mole);


        mole.appear(() => {
            this._activeMoles.delete(mole); /* miss om utgång utan träff? */
        });
    }

    handleBoardClick(e) {

        if (e.type === "keydown" && !(e.key === 'Enter' || e.key === ' ')) {
            return;
        }

        const cell = e.target.closest('.cell');
        if (!cell || !this.state.running) return;
        let moleHit = null;
        this._activeMoles.forEach(mole => {
            if (mole.cellEl === cell) {
                moleHit = mole;
            }
        });

        if (moleHit !== null) {
            this.state.score++;
            moleHit.disappear();
            this._activeMoles.delete(moleHit);
            this.updateHud();
        } else {
            this.state.misses++;
            this.updateHud();
        }

        // TODO: om cellen innehåller en aktiv mullvad => poäng; annars öka missar
        // Uppdatera HUD varje gång.
    }

    updateHud() {
        this.scoreEl.textContent = `Poäng: ${this.state.score}`;
        this.timeEl.textContent = `Tid: ${this.state.timeLeft}`;
        this.missesEl.textContent = `Missar: ${this.state.misses}`;
    }
}

