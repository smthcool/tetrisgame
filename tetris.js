const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextCtx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
let score = 0;
let level = 1;
let speed = 1000;
let dropStart = Date.now();
const scale = 20;
const rows = canvas.height/scale;
const columns = canvas.width/scale;
let gameOver = false;
const shapes = [
    [1,1,1,1],// I
    [1,1,1,0,1],// T
    [1,1,1,0,0,1],// L
    [1,1,1,1,0,0],//
    [1,1,0,0,1,1],//
    [0,1,1,1,1],// L
    [1,1,1,1]
]
const colors = [
    '#ed8787',
    '#6640ff',
    '#40ff69',
    '#d9ff40',
    '#ffa640',
    '#00ff00',
    '#ffff00'
]

let currentPiece = null; //Текущая фигура
let nextPiece = null; //Следующая фигура

let board = Array(rows).fill().map(() => Array(columns).fill(0));
//Функция, которая генеирует фигуру

function createPiece() {
    const randomShape = Math.floor(Math.random()*shapes.length);
    const shape = shapes[randomShape];
    const color = colors[randomShape];

    //Создаем фигуру 4x4
    const piece = []
    for (let i = 0; i < 16; i++) {
        piece.push(shape[i] || 0)
    }

    return {
        shape: piece,
        color: color,
        x: Math.floor(columns/2)-2,
        y: -2
    };
};

function drawSquare(x,y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x*scale, y*scale, scale, scale);
    ctx.strokeStyle='#000';
    ctx.strokeRect(x*scale, y*scale, scale, scale);
};

function drawNextSquare(x,y, color) {
    nextCtx.fillStyle = color;
    nextCtx.fillRect(x*scale/2, y*scale/2, scale/2, scale/2);
    nextCtx.strokeStyle='#000';
    nextCtx.strokeRect(x*scale/2, y*scale/2, scale/2, scale/2);
};

//Отрисовываем игровую поверхность
function drawBoard() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++)
        if (board[r][c]) {
            drawSquare(c,r,board[r][c])
        }
    }
}

//нарисовать кусок
function drawPiece() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++)
        {
            if (currentPiece.shape[r*4+c]) {
               drawSquare(currentPiece.x+c, currentPiece.y + r, currentPiece.color)
            }
        }
    }
}

//Нарисовать следующий кусок
function drawNextPiece() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
 for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++)
        {
            if (nextPiece.shape[r*4+c]) {
               drawNextSquare(c+1, r+1, nextPiece.color)
            }
        }
    }
}



function draw() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    drawBoard();
    drawPiece();
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
            alert('Игра окончена!')
            document.location.reload();
        }
    }
    dropStart = Date.now();
}

//Управление по стрелкам
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

document.addEventListener('keydown', function(e) {
    if (gameOver) return;
    switch(e.keyCode) {
        case 37: //стрелка влево
            moveLeft();
            break;
        case 38: //стрелка вверх
            rotate()
            break;
        case 39: //стрелка вправо
            moveRight();
            break;
        case 40:
            moveDown();
            break;
    }

});

//слить фигуры или закрепить предыдущую на поле
function merge() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (!currentPiece.shape[r*4 + c ])  continue;
            const boardX = currentPiece.x+c;
            const boardY = currentPiece.y+r;

            if (boardY >= 0 ) {
                board[boardY][boardX] = currentPiece.color;
            }
        }
    }
}

function gameLoop() {
    const now = Date.now();
    const delta = now - dropStart;
    if (delta > speed) {
        moveDown();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

//Проверяет уперлась ли куда-нибудь наша фигура

function collision() {
for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (!currentPiece.shape[r*4 + c ]) continue;
            const newX = currentPiece.x + c;
            const newY = currentPiece.y + c;
            if (newX < 0 || newX >= columns || newY >=rows) {
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

function removeRows() {
    for (let r = rows-1; r>=0; r--) {
        let isRowFull= true;
        for (let c = 0; c < columns; c++) {
            if (!board[r][c]) {
                isRowFull = false;
                break;
            }
        }
        if (isRowFull) {
            for (let y = r; y > 0; y--) {
                for (let c = 0; c < columns; c++) {
                    board[y][c] = board[y-1][c];
                }
            }
            for (let c = 0; c< columns; c++) {
                board[0][c] = 0;
            }
            r++; //проверяем строку снова
        }
    }
}

function rotate() {
    const originalShape = [...currentPiece.shape]
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            currentPiece.shape[r*4 + c] = originalShape[(3-c)*4 + r];
        }
    }

    if (collision()) {
        currentPiece.shape = originalShape;
    }
}

currentPiece = createPiece();
nextPiece = createPiece();
drawNextPiece();
gameLoop();