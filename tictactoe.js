/**
 * Tic-Tac-Toe Pro - Game Logic, AI, Audio & Particle Effects
 */

// ==========================================
// 1. Audio Manager (Web Audio API Synthesizer)
// ==========================================
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    playMove(player) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const freq = player === 'X' ? 440 : 587.33; // A4 for X, D5 for O

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.09);
    }

    playWin() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = this.ctx.currentTime + idx * 0.1;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }

    playTie() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [440, 392, 349.23]; // A4, G4, F4
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = this.ctx.currentTime + idx * 0.12;

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.25);
        });
    }

    playClick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    }
}

// ==========================================
// 2. Confetti Particle System
// ==========================================
class ConfettiManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    launch() {
        this.stop();
        this.particles = [];
        const colors = ['#00f2fe', '#ff3366', '#ffb703', '#9d4edd', '#48cae4', '#ffffff'];
        const count = 120;

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: this.canvas.width / 2 + (Math.random() - 0.5) * 100,
                y: this.canvas.height / 2 + (Math.random() - 0.5) * 50,
                vx: (Math.random() - 0.5) * 18,
                vy: (Math.random() - 0.9) * 18,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 12,
                opacity: 1,
                decay: Math.random() * 0.008 + 0.008
            });
        }

        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let activeCount = 0;
        for (let p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.35; // gravity
            p.vx *= 0.98; // air resistance
            p.rotation += p.rotationSpeed;
            p.opacity -= p.decay;

            if (p.opacity > 0) {
                activeCount++;
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.rotation * Math.PI) / 180);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = Math.max(0, p.opacity);
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                this.ctx.restore();
            }
        }

        if (activeCount > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.stop();
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// ==========================================
// 3. Tic-Tac-Toe Game Controller
// ==========================================
class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.isGameActive = true;
        this.gameMode = 'pvp'; // 'pvp' | 'ai'
        this.aiDifficulty = 'impossible'; // 'easy' | 'medium' | 'impossible'
        this.humanPlayer = 'X';
        this.aiPlayer = 'O';
        this.scores = { X: 0, O: 0, ties: 0 };
        this.isAiThinking = false;

        this.winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        this.sound = new SoundManager();
        this.confetti = new ConfettiManager(document.getElementById('confetti-canvas'));

        this.initDOMElements();
        this.attachEventListeners();
        this.updateUI();
    }

    initDOMElements() {
        this.boxes = document.querySelectorAll('.box');
        this.gameBoard = document.getElementById('game-board');
        this.turnBadge = document.getElementById('turn-badge');
        this.turnText = document.getElementById('turn-text');
        this.scoreX = document.getElementById('score-x');
        this.scoreO = document.getElementById('score-o');
        this.scoreTies = document.getElementById('score-ties');
        this.labelX = document.getElementById('label-x');
        this.labelO = document.getElementById('label-o');
        this.soundToggleBtn = document.getElementById('sound-toggle-btn');
        this.soundIcon = document.getElementById('sound-icon');
        this.resetScoresBtn = document.getElementById('reset-scores-btn');
        this.restartRoundBtn = document.getElementById('restart-round-btn');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.diffSelector = document.getElementById('difficulty-selector');
        this.diffButtons = document.querySelectorAll('.diff-btn');

        // Modal
        this.resultModal = document.getElementById('result-modal');
        this.modalIcon = document.getElementById('modal-icon');
        this.modalTitle = document.getElementById('modal-title');
        this.modalSubtitle = document.getElementById('modal-subtitle');
        this.modalNextBtn = document.getElementById('modal-next-btn');
    }

    attachEventListeners() {
        // Board Cells
        this.boxes.forEach(box => {
            box.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index, 10);
                this.handleCellClick(index);
            });
        });

        // Mode Switcher
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.sound.playClick();
                const mode = btn.dataset.mode;
                if (this.gameMode !== mode) {
                    this.gameMode = mode;
                    this.modeButtons.forEach(b => b.classList.toggle('active', b === btn));
                    this.diffSelector.classList.toggle('hidden', mode !== 'ai');
                    this.updateLabels();
                    this.resetRound();
                }
            });
        });

        // AI Difficulty Switcher
        this.diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.sound.playClick();
                this.aiDifficulty = btn.dataset.diff;
                this.diffButtons.forEach(b => b.classList.toggle('active', b === btn));
                this.resetRound();
            });
        });

        // Sound Toggle
        this.soundToggleBtn.addEventListener('click', () => {
            const enabled = this.sound.toggle();
            this.soundIcon.textContent = enabled ? '🔊' : '🔇';
            this.soundToggleBtn.setAttribute('aria-label', enabled ? 'Mute Sound' : 'Unmute Sound');
        });

        // Reset Scores
        this.resetScoresBtn.addEventListener('click', () => {
            this.sound.playClick();
            this.scores = { X: 0, O: 0, ties: 0 };
            this.updateScoreboard();
            this.resetRound();
        });

        // New Round Buttons
        this.restartRoundBtn.addEventListener('click', () => {
            this.sound.playClick();
            this.resetRound();
        });

        this.modalNextBtn.addEventListener('click', () => {
            this.sound.playClick();
            this.hideModal();
            this.resetRound();
        });

        // Close modal on background click
        this.resultModal.addEventListener('click', (e) => {
            if (e.target === this.resultModal) {
                this.hideModal();
                this.resetRound();
            }
        });
    }

    updateLabels() {
        if (this.gameMode === 'ai') {
            this.labelX.textContent = 'YOU (X)';
            this.labelO.textContent = 'AI (O)';
        } else {
            this.labelX.textContent = 'PLAYER (X)';
            this.labelO.textContent = 'PLAYER (O)';
        }
    }

    handleCellClick(index) {
        if (!this.isGameActive || this.board[index] !== '' || this.isAiThinking) {
            return;
        }

        this.makeMove(index, this.currentPlayer);

        const winResult = this.checkWin(this.board, this.currentPlayer);
        if (winResult) {
            this.handleGameEnd('win', winResult);
            return;
        }

        if (this.isBoardFull(this.board)) {
            this.handleGameEnd('tie');
            return;
        }

        // Switch Player
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateUI();

        // If vs AI and AI's turn
        if (this.gameMode === 'ai' && this.currentPlayer === this.aiPlayer && this.isGameActive) {
            this.triggerAiMove();
        }
    }

    makeMove(index, player) {
        this.board[index] = player;
        const box = this.boxes[index];
        box.textContent = player;
        box.classList.add(player === 'X' ? 'x-cell' : 'o-cell');
        box.disabled = true;
        this.sound.playMove(player);
    }

    triggerAiMove() {
        this.isAiThinking = true;
        this.turnText.textContent = 'THINKING...';

        const delay = Math.random() * 200 + 350; // realistic human-like delay
        setTimeout(() => {
            if (!this.isGameActive) {
                this.isAiThinking = false;
                return;
            }

            const aiIndex = this.getAiMoveIndex();
            this.isAiThinking = false;

            if (aiIndex !== -1) {
                this.makeMove(aiIndex, this.aiPlayer);

                const winResult = this.checkWin(this.board, this.aiPlayer);
                if (winResult) {
                    this.handleGameEnd('win', winResult);
                    return;
                }

                if (this.isBoardFull(this.board)) {
                    this.handleGameEnd('tie');
                    return;
                }

                this.currentPlayer = this.humanPlayer;
                this.updateUI();
            }
        }, delay);
    }

    getAiMoveIndex() {
        const availableMoves = this.getAvailableMoves(this.board);
        if (availableMoves.length === 0) return -1;

        if (this.aiDifficulty === 'easy') {
            // Random move
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        if (this.aiDifficulty === 'medium') {
            // 60% smart, 40% random
            if (Math.random() > 0.4) {
                // Check if AI can win in one move
                for (let move of availableMoves) {
                    const tempBoard = [...this.board];
                    tempBoard[move] = this.aiPlayer;
                    if (this.checkWin(tempBoard, this.aiPlayer)) return move;
                }
                // Check if Human can win in one move, block them
                for (let move of availableMoves) {
                    const tempBoard = [...this.board];
                    tempBoard[move] = this.humanPlayer;
                    if (this.checkWin(tempBoard, this.humanPlayer)) return move;
                }
            }
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        // Impossible: Unbeatable Minimax
        return this.getBestMinimaxMove();
    }

    getAvailableMoves(board) {
        const moves = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') moves.push(i);
        }
        return moves;
    }

    getBestMinimaxMove() {
        let bestScore = -Infinity;
        let bestMove = -1;
        const availableMoves = this.getAvailableMoves(this.board);

        // Optimization: if it's the very first move and center is free, take center
        if (availableMoves.length === 9) return 4;
        if (availableMoves.length === 8 && this.board[4] === '') return 4;

        for (let move of availableMoves) {
            this.board[move] = this.aiPlayer;
            let score = this.minimax(this.board, 0, false, -Infinity, Infinity);
            this.board[move] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    minimax(board, depth, isMaximizing, alpha, beta) {
        if (this.checkWin(board, this.aiPlayer)) {
            return 10 - depth;
        }
        if (this.checkWin(board, this.humanPlayer)) {
            return depth - 10;
        }
        if (this.isBoardFull(board)) {
            return 0;
        }

        const availableMoves = this.getAvailableMoves(board);

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let move of availableMoves) {
                board[move] = this.aiPlayer;
                let evaluation = this.minimax(board, depth + 1, false, alpha, beta);
                board[move] = '';
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let move of availableMoves) {
                board[move] = this.humanPlayer;
                let evaluation = this.minimax(board, depth + 1, true, alpha, beta);
                board[move] = '';
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return minEval;
        }
    }

    checkWin(board, player) {
        for (let pattern of this.winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] === player && board[b] === player && board[c] === player) {
                return { player, pattern };
            }
        }
        return null;
    }

    isBoardFull(board) {
        return board.every(cell => cell !== '');
    }

    handleGameEnd(type, winResult = null) {
        this.isGameActive = false;
        this.disableAllCells();

        if (type === 'win') {
            const winner = winResult.player;
            this.scores[winner]++;
            this.highlightWinningCells(winResult.pattern);
            this.sound.playWin();
            this.confetti.launch();

            let title, subtitle, icon;
            if (this.gameMode === 'ai') {
                if (winner === 'X') {
                    icon = '🎉';
                    title = 'YOU WON!';
                    subtitle = 'Outstanding strategy! You beat the AI!';
                } else {
                    icon = '🤖';
                    title = 'AI WON!';
                    subtitle = 'The machine claimed this round. Try again!';
                }
            } else {
                icon = winner === 'X' ? '⚡' : '🔥';
                title = `PLAYER ${winner} WON!`;
                subtitle = `Congratulations Player ${winner}, outstanding victory!`;
            }

            setTimeout(() => {
                this.showModal(icon, title, subtitle);
            }, 600);
        } else {
            this.scores.ties++;
            this.sound.playTie();
            setTimeout(() => {
                this.showModal('🤝', "IT'S A DRAW!", 'Evenly matched! Nobody gives an inch.');
            }, 400);
        }

        this.updateScoreboard();
    }

    highlightWinningCells(pattern) {
        pattern.forEach(index => {
            this.boxes[index].classList.add('winner-tile');
        });
    }

    disableAllCells() {
        this.boxes.forEach(box => {
            box.disabled = true;
        });
    }

    resetRound() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.isGameActive = true;
        this.isAiThinking = false;
        this.confetti.stop();
        this.hideModal();

        this.boxes.forEach(box => {
            box.textContent = '';
            box.disabled = false;
            box.classList.remove('x-cell', 'o-cell', 'winner-tile');
        });

        this.updateUI();
    }

    updateUI() {
        // Turn Indicator
        this.turnBadge.textContent = this.currentPlayer;
        this.turnBadge.className = `turn-badge turn-${this.currentPlayer.toLowerCase()}`;
        this.turnText.textContent = `${this.currentPlayer}'S TURN`;

        // Board Hover Preview Class
        this.gameBoard.classList.remove('hover-x', 'hover-o');
        if (this.isGameActive && (!this.isAiThinking || this.gameMode === 'pvp')) {
            this.gameBoard.classList.add(`hover-${this.currentPlayer.toLowerCase()}`);
        }
    }

    updateScoreboard() {
        this.scoreX.textContent = this.scores.X;
        this.scoreO.textContent = this.scores.O;
        this.scoreTies.textContent = this.scores.ties;
    }

    showModal(icon, title, subtitle) {
        this.modalIcon.textContent = icon;
        this.modalTitle.textContent = title;
        this.modalSubtitle.textContent = subtitle;
        this.resultModal.classList.remove('hidden');
    }

    hideModal() {
        this.resultModal.classList.add('hidden');
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.ticTacToe = new TicTacToeGame();
});
