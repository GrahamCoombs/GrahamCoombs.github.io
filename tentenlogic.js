class Game {
    constructor() {
        this.grid = Array(10).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.pieces = [];
        this.draggedPiece = null;
        this.draggedElement = null;
        this.dragOffset = { x: 0, y: 0 };
        this.initGrid();
        this.generatePieces();
        this.updateScore();
        this.setupRestartButton();
    }

    setupRestartButton() {
        document.getElementById('restart-button').addEventListener('click', () => {
            this.restart();
        });
    }

    restart() {
        this.grid = Array(10).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.pieces = [];
        this.generatePieces();
        this.updateScore();
        this.renderGrid();
        document.getElementById('game-over').style.display = 'none';
    }

    initGrid() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                gridElement.appendChild(cell);
            }
        }

        // Add grid event listeners for drag and drop
        gridElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (this.draggedPiece !== null) {
                this.handleDragOver(e);
            }
        });

        gridElement.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedPiece !== null) {
                this.handleDrop(e);
            }
        });
    }

    generatePieces() {
        const pieces = [
            // Single square
            [[1]],
            // 2x2 square
            [[1,1],
             [1,1]],
            // Line pieces
            [[1,1,1]],
            [[1],
             [1],
             [1]],
            // L pieces
            [[1,0],
             [1,1]],
            [[1,1],
             [1,0]],
        ];

        this.pieces = [];
        for (let i = 0; i < 3; i++) {
            this.pieces.push(pieces[Math.floor(Math.random() * pieces.length)]);
        }
        this.renderPieces();
        
        // Check if game is over at the start of a new turn
        if (!this.canPlaceAnyPiece()) {
            this.gameOver();
        }
    }

    renderPieces() {
        const container = document.getElementById('pieces-container');
        container.innerHTML = '';
        
        this.pieces.forEach((piece, index) => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'piece-preview';
            pieceElement.style.gridTemplateColumns = `repeat(${piece[0].length}, 30px)`;
            pieceElement.draggable = true;
            pieceElement.dataset.index = index;
            
            for (let i = 0; i < piece.length; i++) {
                for (let j = 0; j < piece[0].length; j++) {
                    const cell = document.createElement('div');
                    cell.className = 'preview-cell';
                    if (piece[i][j] === 1) {
                        cell.classList.add('filled');
                    }
                    pieceElement.appendChild(cell);
                }
            }
            
            // Add drag event listeners
            pieceElement.addEventListener('dragstart', (e) => {
                this.draggedPiece = { piece, index };
                pieceElement.style.opacity = '0.4';
            });

            pieceElement.addEventListener('dragend', () => {
                pieceElement.style.opacity = '1';
                this.clearHighlights();
                this.draggedPiece = null;
            });

            container.appendChild(pieceElement);
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        this.clearHighlights();
        
        const gridRect = document.getElementById('grid').getBoundingClientRect();
        const cellSize = 42; // cell size + gap
        const row = Math.floor((e.clientY - gridRect.top) / cellSize);
        const col = Math.floor((e.clientX - gridRect.left) / cellSize);
        
        if (this.draggedPiece) {
            const piece = this.draggedPiece.piece;
            const canPlace = this.canPlacePiece(row, col, piece);
            
            for (let i = 0; i < piece.length; i++) {
                for (let j = 0; j < piece[0].length; j++) {
                    if (piece[i][j] === 1) {
                        const targetCell = this.getCellElement(row + i, col + j);
                        if (targetCell) {
                            targetCell.classList.add(canPlace ? 'highlight' : 'invalid');
                        }
                    }
                }
            }
        }
    }

    handleDrop(e) {
        const gridRect = document.getElementById('grid').getBoundingClientRect();
        const cellSize = 42; // cell size + gap
        const row = Math.floor((e.clientY - gridRect.top) / cellSize);
        const col = Math.floor((e.clientX - gridRect.left) / cellSize);

        if (this.draggedPiece && this.canPlacePiece(row, col, this.draggedPiece.piece)) {
            this.placePiece(row, col, this.draggedPiece.piece);
            this.pieces.splice(this.draggedPiece.index, 1);
            
            if (this.pieces.length === 0) {
                this.generatePieces();
            } else {
                this.renderPieces();
                // Check if remaining pieces can be placed
                if (!this.canPlaceAnyPiece()) {
                    this.gameOver();
                }
            }
        }
        
        this.clearHighlights();
    }

    getCellElement(row, col) {
        return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    }

    clearHighlights() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('highlight', 'invalid');
        });
    }

    canPlaceAnyPiece() {
        for (let piece of this.pieces) {
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    if (this.canPlacePiece(i, j, piece)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    gameOver() {
        document.getElementById('game-over').style.display = 'flex';
        document.getElementById('final-score').textContent = this.score;
    }

    canPlacePiece(row, col, piece) {
        if (row < 0 || col < 0 || row + piece.length > 10 || col + piece[0].length > 10) return false;
        
        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[0].length; j++) {
                if (piece[i][j] === 1 && this.grid[row + i][col + j] === 1) {
                    return false;
                }
            }
        }
        return true;
    }

    placePiece(row, col, piece) {
        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[0].length; j++) {
                if (piece[i][j] === 1) {
                    this.grid[row + i][col + j] = 1;
                }
            }
        }
        this.checkLines();
        this.renderGrid();
    }

    checkLines() {
        let linesCleared = 0;
        
        // Check rows
        for (let i = 0; i < 10; i++) {
            if (this.grid[i].every(cell => cell === 1)) {
                this.grid[i] = Array(10).fill(0);
                linesCleared++;
            }
        }
        
        // Check columns
        for (let j = 0; j < 10; j++) {
            if (this.grid.every(row => row[j] === 1)) {
                for (let i = 0; i < 10; i++) {
                    this.grid[i][j] = 0;
                }
                linesCleared++;
            }
        }
        
        if (linesCleared > 0) {
            this.score += linesCleared * 10;
            this.updateScore();
        }
    }

    renderGrid() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            cell.classList.toggle('filled', this.grid[row][col] === 1);
        });
    }

    updateScore() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
    }
}

// Start the game
const game = new Game();