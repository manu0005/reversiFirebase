import { Observable } from 'rxjs';
import {UserInfo} from 'firebase';

export enum C {Empty, Player1, Player2}
export type Turn  = C.Player1 | C.Player2;

export type L     = [C, C, C, C, C, C, C, C];
export type Board = [L, L, L, L, L, L, L, L];

export interface TileCoords {
  x: number;
  y: number;
}
export type PlayImpact = TileCoords[];

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

export interface LocalGame {
  player1: UserInfo;
  player2: UserInfo;
  turn: Turn;
  board: Board;
}

// ______________________ Firebase ______________________
export interface FbGame {
  player1: UserInfo;
  player2: UserInfo;
  turn: Turn;
  board: C[];
}

export function FbGameToLocal(fbGame: FbGame): LocalGame {
  return {...fbGame, board: ArrayCToBoard(fbGame.board)};
}

export function LocalGameToFb(localGame: LocalGame): FbGame {
  return {...localGame, board: boardToArrayC(localGame.board)};
}

export function ArrayCToBoard(T: C[]): Board {
  const B: C[][] = [];
  for (let i = 0; i < 8; i++) {
    B.push(T.slice(8 * i, 8 * (i + 1)));
  }
  return B as Board;
}

export function boardToArrayC(board: Board): C[] {
  return board.reduce( (acc, line) => [...acc, ...line], [] as C[]);
}
