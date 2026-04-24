// Pure functions — no database, no HTTP
 
function generateFullBoard() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(board);
  return board;
}
 
function fillBoard(board) {
  const empty = findEmpty(board);
  if (!empty) return true;
  const [r, c] = empty;
  for (const n of shuffle([1,2,3,4,5,6,7,8,9])) {
    if (isValid(board, r, c, n)) {
      board[r][c] = n;
      if (fillBoard(board)) return true;
      board[r][c] = 0;
    }
  }
  return false;
}
 
function findEmpty(board) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] === 0) return [r, c];
  return null;
}
 
function isValid(board, row, col, num) {
  if (board[row].includes(num)) return false;
  if (board.some(r => r[col] === num)) return false;
  const br = Math.floor(row/3)*3, bc = Math.floor(col/3)*3;
  for (let r = br; r < br+3; r++)
    for (let c = bc; c < bc+3; c++)
      if (board[r][c] === num) return false;
  return true;
}
 
function shuffle(arr) {
  for (let i = arr.length-1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
 
const REMOVES = { EASY: 36, MEDIUM: 46, HARD: 54 };
 
function makePuzzle(solution, difficulty) {
  const puzzle  = solution.map(r => [...r]);
  const cells   = shuffle([...Array(81).keys()]);
  let removed   = 0;
  for (const idx of cells) {
    if (removed >= REMOVES[difficulty]) break;
    const r = Math.floor(idx/9), c = idx%9;
    puzzle[r][c] = 0;
    removed++;
  }
  return puzzle;
}
 
function isSolved(board, solution) {
  return board.every((row, r) => row.every((v, c) => v === solution[r][c]));
}
 
module.exports = { generateFullBoard, makePuzzle, isValid, isSolved };
 
