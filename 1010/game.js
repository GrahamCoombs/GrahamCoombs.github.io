class Game {
    constructor() {
        // Initialize game state
        this.grid = Array(10).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.pieces = [];
        this.draggedPiece = null;
        
        // Set up the game board and pieces
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

    // Reset the game state for a new game
    restart() {
        this.grid = Array(10).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.pieces = [];
        this.generatePieces();
        this.updateScore();
        this.renderGrid();
        document.getElementById('game-over').style.display = 'none';
    }

    // Initialize the game grid with event listeners
    initGrid() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';
        
        // Create the 10x10 grid cells
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                gridElement.appendChild(cell);
            }
        }

        // Add drag and drop event listeners to the grid
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

    // Generate three random pieces for the next turn
    generatePieces() {
        // Define all possible pieces with their types
        const pieces = [
            // Single square
            { shape: [[1]], type: 'single' },
            // 2x2 square
            { shape: [[1,1],
                     [1,1]], type: 'double' },
            // Horizontal line
            { shape: [[1,1,1]], type: 'line' },
            // Vertical line
            { shape: [[1],
                     [1],
                     [1]], type: 'line' },
            // L pieces
            { shape: [[1,0,0],
                     [1,0,0],
                     [1,1,1]], type: 'l-shape' },
            { shape: [[1,1],
                     [1,0]], type: 'l-shape' },
        ];

        // Select three random pieces
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

    // Render the available pieces in the pieces container
    renderPieces() {
        const container = document.getElementById('pieces-container');
        container.innerHTML = '';
        
        this.pieces.forEach((piece, index) => {
            const pieceElement = document.createElement('div');
            pieceElement.className = 'piece-preview';
            pieceElement.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, 30px)`;
            pieceElement.draggable = true;
            pieceElement.dataset.index = index;
            
            // Create the visual representation of the piece
            for (let i = 0; i < piece.shape.length; i++) {
                for (let j = 0; j < piece.shape[0].length; j++) {
                    const cell = document.createElement('div');
                    cell.className = 'preview-cell';
                    if (piece.shape[i][j] === 1) {
                        cell.classList.add('filled', piece.type);
                    }
                    pieceElement.appendChild(cell);
                }
            }
            
            // Add drag event listeners to the piece
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

    // Handle the drag over event for piece placement preview
    handleDragOver(e) {
        e.preventDefault();
        this.clearHighlights();
        
        // Calculate grid position from mouse coordinates
        const gridRect = document.getElementById('grid').getBoundingClientRect();
        const cellSize = 42; // cell size + gap
        const row = Math.floor((e.clientY - gridRect.top) / cellSize);
        const col = Math.floor((e.clientX - gridRect.left) / cellSize);
        
        if (this.draggedPiece) {
            const piece = this.draggedPiece.piece;
            const canPlace = this.canPlacePiece(row, col, piece.shape);
            
            // Show placement preview
            for (let i = 0; i < piece.shape.length; i++) {
                for (let j = 0; j < piece.shape[0].length; j++) {
                    if (piece.shape[i][j] === 1) {
                        const targetCell = this.getCellElement(row + i, col + j);
                        if (targetCell) {
                            targetCell.classList.add(canPlace ? 'highlight' : 'invalid');
                        }
                    }
                }
            }
        }
    }

    // Handle the drop event for piece placement
    handleDrop(e) {
        const gridRect = document.getElementById('grid').getBoundingClientRect();
        const cellSize = 42; // cell size + gap
        const row = Math.floor((e.clientY - gridRect.top) / cellSize);
        const col = Math.floor((e.clientX - gridRect.left) / cellSize);

        if (this.draggedPiece && this.canPlacePiece(row, col, this.draggedPiece.piece.shape)) {
            this.placePiece(row, col, this.draggedPiece.piece);
            this.pieces.splice(this.draggedPiece.index, 1);
            
            // Generate new pieces if all current pieces are used
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

    // Get a cell element by its grid coordinates
    getCellElement(row, col) {
        return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    }

    // Clear all highlight effects from the grid
    clearHighlights() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('highlight', 'invalid');
        });
    }

    // Check if any remaining piece can be placed on the board
    canPlaceAnyPiece() {
        for (let piece of this.pieces) {
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    if (this.canPlacePiece(i, j, piece.shape)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Handle game over state
    gameOver() {
        document.getElementById('game-over').style.display = 'flex';
        document.getElementById('final-score').textContent = this.score;
    }

    // Check if a piece can be placed at the given position
    canPlacePiece(row, col, shape) {
        if (row < 0 || col < 0 || row + shape.length > 10 || col + shape[0].length > 10) return false;
        
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[0].length; j++) {
                if (shape[i][j] === 1 && this.grid[row + i][col + j] === 1) {
                    return false;
                }
            }
        }
        return true;
    }

    // Place a piece on the grid
    placePiece(row, col, piece) {
        for (let i = 0; i < piece.shape.length; i++) {
            for (let j = 0; j < piece.shape[0].length; j++) {
                if (piece.shape[i][j] === 1) {
                    // Store both the filled state and the piece type
                    this.grid[row + i][col + j] = { filled: 1, type: piece.type };
                }
            }
        }
        this.checkLines();
        this.renderGrid();
    }

    // Check for completed lines (rows and columns)
    checkLines() {
        let linesCleared = 0;
        
        // Check rows
        for (let i = 0; i < 10; i++) {
            if (this.grid[i].every(cell => cell !== 0)) {
                this.grid[i] = Array(10).fill(0);
                linesCleared++;
            }
        }
        
        // Check columns
        for (let j = 0; j < 10; j++) {
            if (this.grid.every(row => row[j] !== 0)) {
                for (let i = 0; i < 10; i++) {
                    this.grid[i][j] = 0;
                }
                linesCleared++;
            }
        }
        
        // Update score for cleared lines
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

            //remove existing classes
            cell.classList.remove('filled', 'single', 'double', 'line', 'l-shape');

            if (this.grid[row][col] !== 0) {
                cell.classList.add('filled');
                cell.classList.add(this.grid[row][col].type);  // Add the piece type class
            }
        });
    }

    updateScore() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
    }
}

// Start the game
const game = new Game();