const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');

const scale = 20;
const rows = canvas.height / scale;
const columns = canvas.width / scale;

let score = 0;
let level = 1;
let speed = 1000;
let dropStart = Date.now();
let gameOver = false;

// Фигуры тетриса
const shapes = [
    [1, 1, 1, 1],    // I
    [1, 1, 1, 0, 1], // T
    [1, 1, 1, 0, 0, 1], // L
    [1, 1, 1, 1, 0, 0], // J
    [1, 1, 0, 0, 1, 1], // Z
    [0, 1, 1, 1, 1], // S
    [1, 1, 1, 1]     // O
];

// Цвета фигур
const colors = [
    '#00FFFF', // I - голубой
    '#AA00FF', // T - фиолетовый
    '#FFA500', // L - оранжевый
    '#0000FF', // J - синий
    '#FF0000', // Z - красный
    '#00FF00', // S - зеленый
    '#FFFF00'  // O - желтый
];

let board = Array(rows).fill().map(() => Array(columns).fill(0));

// Текущая и следующая фигуры
let currentPiece = null;
let nextPiece = null;

function createPiece() {
    const randomShape = Math.floor(Math.random() * shapes.length);
    const shape = shapes[randomShape];
    const color = colors[randomShape];
    
    // Создаем фигуру 4x4
    const piece = [];
    for (let i = 0; i < 16; i++) {
        piece.push(shape[i] || 0);
    }
    
    return {
        shape: piece,
        color: color,
        x: Math.floor(columns / 2) - 2,
        y: -2
    };
}

function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * scale, y * scale, scale, scale);
    
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * scale, y * scale, scale, scale);
}

function drawNextSquare(x, y, color) {
    nextCtx.fillStyle = color;
    nextCtx.fillRect(x * scale/2, y * scale/2, scale/2, scale/2);
    
    nextCtx.strokeStyle = '#000';
    nextCtx.strokeRect(x * scale/2, y * scale/2, scale/2, scale/2);
}

function drawBoard() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c]) {
                drawSquare(c, r, board[r][c]);
            }
        }
    }
}

function drawPiece() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (currentPiece.shape[r * 4 + c]) {
                drawSquare(currentPiece.x + c, currentPiece.y + r, currentPiece.color);
            }
        }
    }
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (nextPiece.shape[r * 4 + c]) {
                drawNextSquare(c + 1, r + 1, nextPiece.color);
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBoard();
    drawPiece();
    
    scoreElement.textContent = score;
    levelElement.textContent = level;
}

function moveDown() {
    currentPiece.y++;
    if (collision()) {
        currentPiece.y--;
        merge();
        removeRows();
        currentPiece = nextPiece;
        nextPiece = createPiece();
        drawNextPiece();
        if (collision()) {
            gameOver = true;
            alert('Игра окончена! Ваш счет: ' + score);
            document.location.reload();
        }
    }
    dropStart = Date.now();
}

function moveLeft() {
    currentPiece.x--;
    if (collision()) {
        currentPiece.x++;
    }
}

function moveRight() {
    currentPiece.x++;
    if (collision()) {
        currentPiece.x--;
    }
}

function rotate() {
    const originalShape = [...currentPiece.shape];
    
    // Поворачиваем фигуру
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            currentPiece.shape[r * 4 + c] = originalShape[(3 - c) * 4 + r];
        }
    }
    
    if (collision()) {
        currentPiece.shape = originalShape;
    }
}

function collision() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (!currentPiece.shape[r * 4 + c]) continue;
            
            const newX = currentPiece.x + c;
            const newY = currentPiece.y + r;
            
            if (newX < 0 || newX >= columns || newY >= rows) {
                return true;
            }
            
            if (newY < 0) continue;
            
            if (board[newY][newX]) {
                return true;
            }
        }
    }
    return false;
}

function merge() { 
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (!currentPiece.shape[r * 4 + c]) continue;
            
            const boardX = currentPiece.x + c;
            const boardY = currentPiece.y + r;
            
            if (boardY >= 0) {
                board[boardY][boardX] = currentPiece.color;
            }
        }
    }
}

function removeRows() {
    let rowsCleared = 0;
    
    for (let r = rows - 1; r >= 0; r--) {
        let isRowFull = true;
        
        for (let c = 0; c < columns; c++) {
            if (!board[r][c]) {
                isRowFull = false;
                break;
            }
        }
        
        if (isRowFull) {
            // Удаляем строку
            for (let y = r; y > 0; y--) {
                for (let c = 0; c < columns; c++) {
                    board[y][c] = board[y-1][c];
                }
            }
            
            // Очищаем верхнюю строку
            for (let c = 0; c < columns; c++) {
                board[0][c] = 0;
            }
            
            rowsCleared++;
            r++; // Проверяем эту же строку снова
        }
    }
    
    if (rowsCleared > 0) {
        score += rowsCleared * rowsCleared * 100 * level;
        
        // Увеличиваем уровень каждые 10 очков
        level = Math.floor(score / 1000) + 1;
        speed = Math.max(100, 1000 - (level - 1) * 100);
    }
}

// Управление
document.addEventListener('keydown', function(e) {
    if (gameOver) return;
    
    switch(e.keyCode) {
        case 37: // стрелка влево
            moveLeft();
            break;
        case 38: // стрелка вверх
            rotate();
            break;
        case 39: // стрелка вправо
            moveRight();
            break;
        case 40: // стрелка вниз
            moveDown();
            break;
    }
});

// Игровой цикл
function gameLoop() {
    const now = Date.now();
    const delta = now - dropStart;
    
    if (delta > speed) {
        moveDown();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Начало игры
currentPiece = createPiece();
nextPiece = createPiece();
drawNextPiece();
gameLoop();