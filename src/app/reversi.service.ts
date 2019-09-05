import { Injectable } from '@angular/core';
import {Board, boardsEqual, C, FbGame, ReversiModelInterface, Turn} from './ReversiDefinitions';
import {BehaviorSubject} from 'rxjs';
import {AngularFirestore, DocumentSnapshot} from '@angular/fire/firestore';
import {filter} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReversiService implements ReversiModelInterface {
  private board: Board;
  private subject = new BehaviorSubject<ReversiModelInterface>(undefined);
  readonly obs = this.subject.asObservable();
  currentTurn: Turn;

  constructor(private db: AngularFirestore) {
    this.initBoard();
    // Je vais chercher la partie commune :
    const commune = db.doc<FbGame>('/parties/commune');

    // Local -> Firebase
    this.obs.pipe( filter(m => !!m) ).subscribe( () => commune.set(this.toFireStore(this.board)) );

    // FireBase -> Local
    commune.valueChanges().pipe( filter(g => !!g) ).subscribe( game => this.fbToLocal(game) );
  }

  toFireStore(board: Board): FbGame {
    return {
      player1: 'Bob',
      player2: 'Jacques',
      turn: this.turn(),
      board: board.reduce( (acc, L) => [...acc, ...L], [] as C[])
    };
  }

  getObservable() {
    return this.obs;
  }

  getBoard() {
    return this.board;
  }

  canPlay(x, y) {
    if (this.board[x][y] === C.Empty) {
      const otherTile = this.turn() === C.Player1 ? C.Player2 : C.Player1;
      const tilesToFlip = [];
      [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]].forEach(([dx, dy]) => {
        let posX = x;
        let posY = y;
        const L = [];
        do {
          posX += dx;
          posY += dy;
          L.push({ x: posX, y: posY });
        } while (posX >= 0 && posY >= 0 && posX < 8 && posY < 8 && this.board[posX][posY] === otherTile);
        if (posX >= 0 && posY >= 0 && posX < 8 && posY < 8
          && this.board[posX][posY] === this.turn()
          && (Math.abs(posX - x) >= 2 || Math.abs(posY - y) >= 2)) {
          tilesToFlip.push(...L);
        }
      });
      return tilesToFlip;
    }
    return [];
  }
  turn() {
    return this.currentTurn;
  }
  play(i, j) {
    const L = this.canPlay(i, j);
    if (L.length) {
      this.board[i][j] = this.turn();
      L.forEach(({ x, y }) => this.board[x][y] = this.turn());
      this.currentTurn = this.turn() === C.Player1 ? C.Player2 : C.Player1;
      if (this.skipTurn()) {
        console.log('Skip turn');
        this.currentTurn = this.turn() === C.Player1 ? C.Player2 : C.Player1;
      }
      this.subject.next(this);
    }
  }

  private skipTurn(): boolean {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.canPlay(i, j).length > 0) {
          return false;
        }
      }
    }
    return true;
  }

  private async initBoard() {
    try {
      const commune: DocumentSnapshot<FbGame> = await this.db.doc('/parties/commune').get().toPromise();
      console.log( commune );
      this.fbToLocal( commune.data() );
    } catch (e) {
      this.currentTurn = C.Player1;
      this.board = new Array(8).fill(0).map(l => new Array(8).fill(C.Empty)) as Board;
      this.board[3][3] = this.board[4][4] = C.Player1;
      this.board[4][3] = this.board[3][4] = C.Player2;
    }
    console.log( 'turn', this.turn(), 'Board:', this.board );
    this.subject.next(this);
  }

  private fbToLocal(game: FbGame) {
    const T = game.board;
    const B: C[][] = [];
    for (let i = 0; i < 8; i++) {
      B.push(T.slice(8 * i, 8 * (i + 1)));
    }
    if (this.turn() !== game.turn || !boardsEqual(this.board, B as Board)) {
      this.currentTurn = game.turn;
      this.board = B as Board;
      this.subject.next(this);
    }
  }
}
