import { Observable } from 'rxjs';

export enum C {Empty, Player1, Player2}
export type Turn  = C.Player1 | C.Player2;

export type L     = [C, C, C, C, C, C, C, C];
export type Board = [L, L, L, L, L, L, L, L];

export interface TileCoords {
  x: number;
  y: number;
}
export type PlayImpact = TileCoords[];

export interface ReversiModelInterface {
  getBoard(): Board;
  canPlay(x: number, y: number): PlayImpact;
  turn(): Turn;
  play(i: number, j: number): void;
  getObservable(): Observable<ReversiModelInterface>;
}

export interface TileCoords {
  x: number;
  y: number;
}

export function CtoString(c: C): string {
  switch (c) {
    case C.Empty: return 'Empty';
    case C.Player1: return 'Player1';
    case C.Player2: return 'Player2';
  }
}

export function boardsEqual(B1: Board, B2: Board): boolean {
  return false;
}

export interface FbGame {
  player1: string;
  player2: string;
  turn: Turn;
  board: C[];
}
