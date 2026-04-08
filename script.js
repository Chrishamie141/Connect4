const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER = 1;
const AI = 2;
const WIN_LENGTH = 4;

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const difficultyEl = document.getElementById('difficulty');
const playerScoreEl = document.getElementById('playerScore');
const aiScoreEl = document.getElementById('aiScore');
const drawScoreEl = document.getElementById('drawScore');

const gameState = {
  board: createBoard(),
  gameOver: false,
  aiThinking: false,
  difficulty: difficultyEl.value,
  scores: {
    player: 0,
    ai: 0,
    draws: 0,
  },
};

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

function resetBoard() {
  gameState.board = createBoard();
  gameState.gameOver = false;
  gameState.aiThinking = false;
  setStatus('Your turn');
  renderBoard();
}

function setStatus(message) {
  statusEl.textContent = message;
}

function renderScoreboard() {
  playerScoreEl.textContent = String(gameState.scores.player);
  aiScoreEl.textContent = String(gameState.scores.ai);
  drawScoreEl.textContent = String(gameState.scores.draws);
}

function renderBoard() {
  const fragment = document.createDocumentFragment();

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `Row ${row + 1}, Column ${col + 1}`);

      const value = gameState.board[row][col];
      if (value === PLAYER) {
        cell.classList.add('red');
      } else if (value === AI) {
        cell.classList.add('yellow');
      } else if (!gameState.gameOver && !gameState.aiThinking && getNextOpenRow(gameState.board, col) !== -1) {
        cell.classList.add('hoverable');
      }

      cell.addEventListener('click', () => handlePlayerMove(col));
      fragment.appendChild(cell);
    }
  }

  boardEl.replaceChildren(fragment);
}

function getNextOpenRow(board, col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === EMPTY) {
      return row;
    }
  }
  return -1;
}

function getValidColumns(board) {
  const validCols = [];
  for (let col = 0; col < COLS; col++) {
    if (getNextOpenRow(board, col) !== -1) {
      validCols.push(col);
    }
  }
  return validCols;
}

function dropPiece(board, row, col, piece) {
  board[row][col] = piece;
}

function isBoardFull(board) {
  return getValidColumns(board).length === 0;
}

function checkWin(board, piece) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (
        board[row][col] === piece &&
        board[row][col + 1] === piece &&
        board[row][col + 2] === piece &&
        board[row][col + 3] === piece
      ) {
        return true;
      }
    }
  }

  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS - 3; row++) {
      if (
        board[row][col] === piece &&
        board[row + 1][col] === piece &&
        board[row + 2][col] === piece &&
        board[row + 3][col] === piece
      ) {
        return true;
      }
    }
  }

  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (
        board[row][col] === piece &&
        board[row + 1][col + 1] === piece &&
        board[row + 2][col + 2] === piece &&
        board[row + 3][col + 3] === piece
      ) {
        return true;
      }
    }
  }

  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (
        board[row][col] === piece &&
        board[row - 1][col + 1] === piece &&
        board[row - 2][col + 2] === piece &&
        board[row - 3][col + 3] === piece
      ) {
        return true;
      }
    }
  }

  return false;
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function evaluateWindow(window, piece) {
  const opponent = piece === AI ? PLAYER : AI;
  const pieceCount = window.filter((cell) => cell === piece).length;
  const emptyCount = window.filter((cell) => cell === EMPTY).length;
  const oppCount = window.filter((cell) => cell === opponent).length;

  let score = 0;

  if (pieceCount === 4) score += 100;
  else if (pieceCount === 3 && emptyCount === 1) score += 10;
  else if (pieceCount === 2 && emptyCount === 2) score += 4;

  if (oppCount === 3 && emptyCount === 1) score -= 12;

  return score;
}

function scorePosition(board, piece) {
  let score = 0;

  const centerArray = board.map((row) => row[Math.floor(COLS / 2)]);
  const centerCount = centerArray.filter((cell) => cell === piece).length;
  score += centerCount * 6;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const window = [board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3]];
      score += evaluateWindow(window, piece);
    }
  }

  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS - 3; row++) {
      const window = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
      score += evaluateWindow(window, piece);
    }
  }

  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const window = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
      score += evaluateWindow(window, piece);
    }
  }

  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const window = [board[row][col], board[row - 1][col + 1], board[row - 2][col + 2], board[row - 3][col + 3]];
      score += evaluateWindow(window, piece);
    }
  }

  return score;
}

function isTerminalNode(board) {
  return checkWin(board, PLAYER) || checkWin(board, AI) || isBoardFull(board);
}

function minimax(board, depth, alpha, beta, maximizingPlayer) {
  const validLocations = getValidColumns(board);
  const terminal = isTerminalNode(board);

  if (depth === 0 || terminal) {
    if (terminal) {
      if (checkWin(board, AI)) return { column: null, score: 1_000_000 };
      if (checkWin(board, PLAYER)) return { column: null, score: -1_000_000 };
      return { column: null, score: 0 };
    }

    return { column: null, score: scorePosition(board, AI) };
  }

  if (maximizingPlayer) {
    let value = -Infinity;
    let bestCol = validLocations[Math.floor(Math.random() * validLocations.length)];

    for (const col of validLocations) {
      const row = getNextOpenRow(board, col);
      const tempBoard = cloneBoard(board);
      dropPiece(tempBoard, row, col, AI);
      const nextScore = minimax(tempBoard, depth - 1, alpha, beta, false).score;

      if (nextScore > value) {
        value = nextScore;
        bestCol = col;
      }

      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }

    return { column: bestCol, score: value };
  }

  let value = Infinity;
  let bestCol = validLocations[Math.floor(Math.random() * validLocations.length)];

  for (const col of validLocations) {
    const row = getNextOpenRow(board, col);
    const tempBoard = cloneBoard(board);
    dropPiece(tempBoard, row, col, PLAYER);
    const nextScore = minimax(tempBoard, depth - 1, alpha, beta, true).score;

    if (nextScore < value) {
      value = nextScore;
      bestCol = col;
    }

    beta = Math.min(beta, value);
    if (alpha >= beta) break;
  }

  return { column: bestCol, score: value };
}

function pickBestHeuristicMove(board, piece) {
  const validCols = getValidColumns(board);
  let bestScore = -Infinity;
  let bestCols = [];

  for (const col of validCols) {
    const row = getNextOpenRow(board, col);
    const tempBoard = cloneBoard(board);
    dropPiece(tempBoard, row, col, piece);

    let score = scorePosition(tempBoard, piece);
    if (col === 3) score += 4;

    if (score > bestScore) {
      bestScore = score;
      bestCols = [col];
    } else if (score === bestScore) {
      bestCols.push(col);
    }
  }

  return bestCols[Math.floor(Math.random() * bestCols.length)];
}

function findImmediateWin(board, piece) {
  const validCols = getValidColumns(board);
  for (const col of validCols) {
    const row = getNextOpenRow(board, col);
    const tempBoard = cloneBoard(board);
    dropPiece(tempBoard, row, col, piece);
    if (checkWin(tempBoard, piece)) {
      return col;
    }
  }
  return null;
}

function chooseAiMove(board, difficulty) {
  const validCols = getValidColumns(board);

  if (difficulty === 'easy') {
    return validCols[Math.floor(Math.random() * validCols.length)];
  }

  if (difficulty === 'medium') {
    const winningMove = findImmediateWin(board, AI);
    if (winningMove !== null) return winningMove;

    const blockingMove = findImmediateWin(board, PLAYER);
    if (blockingMove !== null) return blockingMove;

    return pickBestHeuristicMove(board, AI);
  }

  const winningMove = findImmediateWin(board, AI);
  if (winningMove !== null) return winningMove;

  const blockingMove = findImmediateWin(board, PLAYER);
  if (blockingMove !== null) return blockingMove;

  const depth = 6;
  const result = minimax(board, depth, -Infinity, Infinity, true);
  if (result.column !== null) {
    return result.column;
  }

  return pickBestHeuristicMove(board, AI);
}

function endGame(message, winner = null) {
  gameState.gameOver = true;
  setStatus(message);

  if (winner === PLAYER) {
    gameState.scores.player += 1;
  } else if (winner === AI) {
    gameState.scores.ai += 1;
  } else {
    gameState.scores.draws += 1;
  }

  renderScoreboard();
  renderBoard();
}

function handlePlayerMove(col) {
  if (gameState.gameOver || gameState.aiThinking) return;

  const row = getNextOpenRow(gameState.board, col);
  if (row === -1) return;

  dropPiece(gameState.board, row, col, PLAYER);
  renderBoard();

  if (checkWin(gameState.board, PLAYER)) {
    endGame('You win', PLAYER);
    return;
  }

  if (isBoardFull(gameState.board)) {
    endGame('Draw');
    return;
  }

  gameState.aiThinking = true;
  setStatus('AI is thinking...');
  renderBoard();

  const delay = 500 + Math.floor(Math.random() * 401);
  window.setTimeout(() => {
    const aiCol = chooseAiMove(gameState.board, gameState.difficulty);
    const aiRow = getNextOpenRow(gameState.board, aiCol);

    if (aiRow !== -1) {
      dropPiece(gameState.board, aiRow, aiCol, AI);
    }

    if (checkWin(gameState.board, AI)) {
      renderBoard();
      gameState.aiThinking = false;
      endGame('AI wins', AI);
      return;
    }

    if (isBoardFull(gameState.board)) {
      renderBoard();
      gameState.aiThinking = false;
      endGame('Draw');
      return;
    }

    gameState.aiThinking = false;
    setStatus('Your turn');
    renderBoard();
  }, delay);
}

restartBtn.addEventListener('click', resetBoard);

difficultyEl.addEventListener('change', (event) => {
  gameState.difficulty = event.target.value;
  resetBoard();
});

renderScoreboard();
renderBoard();
