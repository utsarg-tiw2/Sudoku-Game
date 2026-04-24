import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { newGame, resumeGame, saveMove, completeGame } from '../api/game';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

function isBoardCorrect(board, solution) {
  if (!solution) return false;
  return board.every((row, r) => row.every((v, c) => v === solution[r][c]));
}

export default function Game() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState('medium');
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null).map(() => Array(9).fill(0)));
  const [givens, setGivens] = useState(Array(9).fill(null).map(() => Array(9).fill(0)));
  const [solution, setSolution] = useState(null);
  const solutionRef = useRef(null); // ← ref to avoid stale closure
  const [notes, setNotes] = useState({});
  const [selected, setSelected] = useState(null);
  const [notesMode, setNotesMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [highlightNum, setHighlightNum] = useState(null);
  const [wrongCells, setWrongCells] = useState({});

  const saveRef = useRef(null);
  const gameIdRef = useRef(null);
  const timerRef = useRef(0);
  const mistakesRef = useRef(0);

  // Keep refs in sync
  useEffect(() => { gameIdRef.current = gameId; }, [gameId]);
  useEffect(() => { timerRef.current = timer; }, [timer]);
  useEffect(() => { mistakesRef.current = mistakes; }, [mistakes]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  useEffect(() => {
    loadGame(difficulty, false);
  }, [difficulty]);

  const setDifficultyAndLoad = (d) => {
    setDifficulty(d);
  };

  const loadGame = async (diff, forceNew = false) => {
    setLoading(true);
    setWon(false);
    setWrongCells({});
    setSolution(null);
    solutionRef.current = null;
    setSelected(null);

    if (!forceNew) {
      try {
        const { data } = await resumeGame(diff);
        if (data && data.id) {
          setGameId(data.id);
          gameIdRef.current = data.id;
          setBoard(data.boardState);
          setGivens(data.puzzle.givens);
          setSolution(data.puzzle.solution);
          solutionRef.current = data.puzzle.solution; // ← set ref
          setNotes(data.notesState || {});
          setTimer(data.elapsedSecs || 0);
          timerRef.current = data.elapsedSecs || 0;
          setMistakes(data.mistakes || 0);
          mistakesRef.current = data.mistakes || 0;
          setRunning(true);
          setLoading(false);
          return;
        }
      } catch {}
    }

    try {
      const { data } = await newGame(diff);
      setGameId(data.game.id);
      gameIdRef.current = data.game.id;
      setBoard(data.game.boardState);
      setGivens(data.puzzle.givens);
      setSolution(data.puzzle.solution);
      solutionRef.current = data.puzzle.solution; // ← set ref
      setNotes({});
      setTimer(0);
      timerRef.current = 0;
      setMistakes(0);
      mistakesRef.current = 0;
      setRunning(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const startNewGame = () => loadGame(difficulty, true);

  useEffect(() => {
    if (!gameId || won) return;
    clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      saveMove(gameId, board, notes, timer, mistakes).catch(() => {});
    }, 1500);
    return () => clearTimeout(saveRef.current);
  }, [board, notes, timer]);

  const handleCellClick = (r, c) => {
    setSelected([r, c]);
    setHighlightNum(board[r][c] || null);
  };

  // Use refs inside handleNumber to avoid stale closures
  const boardRef = useRef(board);
  const givensRef = useRef(givens);
  const notesRef = useRef(notes);
  const notesModeRef = useRef(notesMode);
  const wonRef = useRef(won);
  const selectedRef = useRef(selected);

  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { givensRef.current = givens; }, [givens]);
  useEffect(() => { notesRef.current = notes; }, [notes]);
  useEffect(() => { notesModeRef.current = notesMode; }, [notesMode]);
  useEffect(() => { wonRef.current = won; }, [won]);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const handleNumber = useCallback((num) => {
    const sel = selectedRef.current;
    const currentWon = wonRef.current;
    const currentBoard = boardRef.current;
    const currentGivens = givensRef.current;
    const currentNotes = notesRef.current;
    const currentNotesMode = notesModeRef.current;
    const currentSolution = solutionRef.current; // ← always fresh

    if (!sel || currentWon) return;
    const [r, c] = sel;
    if (currentGivens[r][c] !== 0) return;

    if (currentNotesMode) {
      const key = `${r}-${c}`;
      const cellNotes = new Set(currentNotes[key] || []);
      cellNotes.has(num) ? cellNotes.delete(num) : cellNotes.add(num);
      setNotes(prev => ({ ...prev, [key]: [...cellNotes] }));
      return;
    }

    const newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = num;

    if (currentSolution && currentSolution[r][c] !== num) {
      setWrongCells(prev => ({ ...prev, [`${r}-${c}`]: true }));
      setMistakes(m => {
        mistakesRef.current = m + 1;
        return m + 1;
      });
    } else {
      setWrongCells(prev => { const n = { ...prev }; delete n[`${r}-${c}`]; return n; });
    }

    setBoard(newBoard);
    boardRef.current = newBoard;
    setHighlightNum(num);

    if (currentSolution && isBoardCorrect(newBoard, currentSolution)) {
      setWon(true);
      wonRef.current = true;
      setRunning(false);
      completeGame(gameIdRef.current, timerRef.current, mistakesRef.current).catch(() => {});
    }
  }, []);

  const handleErase = useCallback(() => {
    const sel = selectedRef.current;
    const currentWon = wonRef.current;
    const currentGivens = givensRef.current;
    const currentBoard = boardRef.current;

    if (!sel || currentWon) return;
    const [r, c] = sel;
    if (currentGivens[r][c] !== 0) return;
    const newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = 0;
    setBoard(newBoard);
    boardRef.current = newBoard;
    setWrongCells(prev => { const n = { ...prev }; delete n[`${r}-${c}`]; return n; });
    setNotes(prev => { const n = { ...prev }; delete n[`${r}-${c}`]; return n; });
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key >= '1' && e.key <= '9') handleNumber(parseInt(e.key));
      if (e.key === 'Backspace' || e.key === 'Delete') handleErase();
      if (e.key === 'n' || e.key === 'N') setNotesMode(m => !m);
      const sel = selectedRef.current;
      if (!sel) return;
      const [r, c] = sel;
      if (e.key === 'ArrowUp')    setSelected([Math.max(0, r - 1), c]);
      if (e.key === 'ArrowDown')  setSelected([Math.min(8, r + 1), c]);
      if (e.key === 'ArrowLeft')  setSelected([r, Math.max(0, c - 1)]);
      if (e.key === 'ArrowRight') setSelected([r, Math.min(8, c + 1)]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNumber, handleErase]);

  const getCellClass = (r, c) => {
    const classes = ['cell'];
    const key = `${r}-${c}`;
    if (givens[r][c] !== 0) classes.push('given');
    if (selected) {
      const [sr, sc] = selected;
      if (sr === r && sc === c) classes.push('selected');
      else if (sr === r || sc === c) classes.push('highlighted');
      else if (Math.floor(sr / 3) === Math.floor(r / 3) && Math.floor(sc / 3) === Math.floor(c / 3)) classes.push('highlighted');
    }
    if (highlightNum && board[r][c] === highlightNum && highlightNum !== 0) classes.push('same-number');
    if (wrongCells[key]) classes.push('wrong');
    if (board[r][c] !== 0 && !givens[r][c] && !wrongCells[key]) classes.push('filled');
    return classes.join(' ');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="loader"></div>
      <p>Loading puzzle...</p>
    </div>
  );

  return (
    <div className="game-page">
      <header className="game-header">
        <div className="header-logo">⬛ SUDOKU</div>
        <div className="header-user">
          <button className="btn-ghost" onClick={() => navigate('/leaderboard')}>🏆 Leaderboard</button>
          <span>@{user?.username}</span>
          <button onClick={handleLogout} className="btn-ghost">Logout</button>
        </div>
      </header>

      <div className="game-layout">
        <div className="game-sidebar">
          <div className="stat-card">
            <span className="stat-label">TIME</span>
            <span className="stat-value">{formatTime(timer)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">MISTAKES</span>
            <span className="stat-value mistakes">{mistakes}</span>
          </div>
          <div className="difficulty-selector">
            <p className="sidebar-label">DIFFICULTY</p>
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                className={`diff-btn ${difficulty === d ? 'active' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                {d.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="btn-new-game" onClick={startNewGame}>
            NEW GAME
          </button>
        </div>

        <div className="board-wrapper">
          {won && (
            <div className="win-overlay">
              <div className="win-card">
                <div className="win-icon">✦</div>
                <h2>SOLVED!</h2>
                <p>{formatTime(timer)} · {mistakes} mistakes</p>
                <button className="btn-primary" onClick={startNewGame}>Play Again</button>
                <button className="btn-ghost" onClick={() => navigate('/leaderboard')}>
                  🏆 View Leaderboard
                </button>
              </div>
            </div>
          )}
          <div className="sudoku-board">
            {board.map((row, r) =>
              row.map((val, c) => {
                const key = `${r}-${c}`;
                const cellNotes = notes[key] || [];
                return (
                  <div
                    key={key}
                    className={getCellClass(r, c)}
                    onClick={() => handleCellClick(r, c)}
                    data-right={c === 2 || c === 5}
                    data-bottom={r === 2 || r === 5}
                  >
                    {val !== 0 ? (
                      <span className="cell-number">{val}</span>
                    ) : cellNotes.length > 0 ? (
                      <div className="notes-grid">
                        {[1,2,3,4,5,6,7,8,9].map(n => (
                          <span key={n} className={`note ${cellNotes.includes(n) ? 'visible' : ''}`}>{n}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="game-sidebar right">
          <div className="controls-label">
            <p className="sidebar-label">MODE</p>
            <button
              className={`mode-btn ${notesMode ? 'active' : ''}`}
              onClick={() => setNotesMode(m => !m)}
            >
              {notesMode ? '✏️ NOTES ON' : '✏️ NOTES OFF'}
            </button>
            <button className="mode-btn" onClick={handleErase}>⌫ ERASE</button>
          </div>
          <p className="sidebar-label">NUMBERS</p>
          <div className="numpad">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button
                key={n}
                className={`num-btn ${highlightNum === n ? 'active' : ''}`}
                onClick={() => handleNumber(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}