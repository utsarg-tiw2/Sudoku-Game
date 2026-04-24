import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [period, setPeriod] = useState('alltime');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/leaderboard?difficulty=${difficulty}&period=${period}`)
      .then(({ data }) => setScores(data.scores || []))
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
  }, [difficulty, period]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="leaderboard-page">
      <header className="game-header">
        <div className="header-logo">⬛ SUDOKU</div>
        <button className="btn-ghost" onClick={() => navigate('/')}>← Back</button>
      </header>

      <div className="leaderboard-container">
        <h1 className="lb-title">LEADERBOARD</h1>

        <div className="lb-filters">
          <div className="filter-group">
            {['EASY','MEDIUM','HARD'].map(d => (
              <button key={d} className={`filter-btn ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</button>
            ))}
          </div>
          <div className="filter-group">
            {['alltime','weekly'].map(p => (
              <button key={p} className={`filter-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                {p === 'alltime' ? 'ALL TIME' : 'THIS WEEK'}
              </button>
            ))}
          </div>
        </div>

        <div className="lb-table">
          <div className="lb-header">
            <span>#</span>
            <span>PLAYER</span>
            <span>TIME</span>
            <span>MISTAKES</span>
          </div>
          {loading ? (
            <div className="lb-loading">Loading...</div>
          ) : scores.length === 0 ? (
            <div className="lb-empty">No scores yet. Be the first!</div>
          ) : (
            scores.map((s, i) => (
              <div key={s.id} className={`lb-row ${i < 3 ? `top-${i+1}` : ''}`}>
                <span className="lb-rank">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </span>
                <span className="lb-name">@{s.user?.username}</span>
                <span className="lb-time">{formatTime(s.elapsedSecs)}</span>
                <span className="lb-mistakes">{s.mistakes}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
