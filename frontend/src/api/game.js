import api from './axios';
 
export const newGame = (difficulty) =>
  api.get(`/games/new?difficulty=${difficulty}`);
 
export const resumeGame = (difficulty) =>
  api.get(`/games/active/${difficulty}`);
 
export const saveMove = (gameId, boardState, notesState, elapsedSecs, mistakes) =>
  api.put(`/games/${gameId}/move`, { boardState, notesState, elapsedSecs, mistakes });
 
export const completeGame = (gameId, elapsedSecs, mistakes) =>
  api.post(`/games/${gameId}/complete`, { elapsedSecs, mistakes });
 
export const getHistory = (page = 1) =>
  api.get(`/games/history?page=${page}`);
 
