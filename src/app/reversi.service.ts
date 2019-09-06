import { Injectable } from '@angular/core';
import {
  Board,
  C,
  FbGame,
  FbGameToLocal,
  LocalGame, LocalGameToFb,
  TileCoords,
  Turn
} from './ReversiDefinitions';
import {BehaviorSubject, ConnectableObservable, Observable, Subscription} from 'rxjs';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import {filter, map, multicast} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReversiService {
  private pgameObs: ConnectableObservable<LocalGame>;
  private gameDoc: AngularFirestoreDocument<FbGame>;
  private game: LocalGame;
  private gameSubscription: Subscription;
  private idGameChamp = 'Manu';

  get idGame(): string {
    return this.idGameChamp;
  }
  set idGame(idGame: string) {
    this.gameSubscription.unsubscribe();
    this.idGameChamp = idGame;
    this.initGame(idGame);
  }

  constructor(private db: AngularFirestore) {
  }

  dispose() {
    this.gameSubscription.unsubscribe();
  }

  get gameObs(): Observable<LocalGame> {
    return this.pgameObs;
  }

  initGame(idDoc?: string) {
    idDoc = idDoc || this.idGame;
    this.gameDoc = this.db.doc<FbGame>(`/partie/${idDoc}`);
    this.pgameObs = this.gameDoc.valueChanges().pipe(
      filter(g => !!g ),
      map(FbGameToLocal),
      multicast( () => new BehaviorSubject<LocalGame>(undefined) )
    ) as ConnectableObservable<LocalGame>;
    this.pgameObs.connect();
    this.gameSubscription = this.pgameObs.subscribe( g => this.game = g );
    this.initBoard();
  }

  tilesGainedIfPlayAt(x, y): TileCoords[] {
    if (this.board[x][y] === C.Empty) {
      const otherTile = this.turn === C.Player1 ? C.Player2 : C.Player1 ;
      const tilesToFlip: TileCoords[] = [];
      // Parcourir les 8 directions à partir de la case x, y
      const D = [ [1, 0], [1, 1], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1] ];
      D.forEach( ([dx, dy]) => {
        // S'arréter dès qu'on est au bord du plateau ou que la case n'est pas otherTile
        let px = x;
        let py = y;
        const L: TileCoords[] = [];
        do {
          px += dx; py += dy;
          if (this.board[px] && this.board[px][py] !== undefined) { // Est ce que je suis toujours sur le plateau ?
            L.push({x: px, y: py});
          } else {
            break;
          }
        } while (this.board[px][py] === otherTile);

        if (this.board[px] && this.board[px][py] === this.turn) {
          L.pop(); // J'enlève le dernier pion, celui qui a déclanché l'arrêt de parcours
          tilesToFlip.push( ...L );
        }
      });

      return tilesToFlip;
    }
    return [];
  }

  play(i, j) {
    const L = this.tilesGainedIfPlayAt(i, j);
    if (L.length) {
      this.board[i][j] = this.turn;
      L.forEach(({ x, y }) => this.board[x][y] = this.turn);
      this.turn = this.turn === C.Player1 ? C.Player2 : C.Player1;
      if (this.skipTurn()) {
        this.turn = this.turn === C.Player1 ? C.Player2 : C.Player1;
      }
      // Commit to Firebase
      this.gameDoc.set( LocalGameToFb(this.game) );
    }
  }

  private skipTurn(): boolean {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.tilesGainedIfPlayAt(i, j).length > 0) {
          return false;
        }
      }
    }
    return true;
  }

  private async initBoard() {
    const fbGameRef = await this.gameDoc.get().toPromise();
    console.log( fbGameRef );
    if (!fbGameRef.exists) {
      const player1 = {
        displayName: 'bob',
        phoneNumber: null,
        email: '',
        uid: 'bob',
        providerId: '1',
        photoURL: 'http://www.bobthebuilder.com/fr-fr/Images/btb_where_to_watch_background_Bob_tcm1281-232957.png'
      };
      const localGame: LocalGame = {
        player1,
        player2: player1,
        turn: C.Player1,
        board: new Array(8).fill(0).map(l => new Array(8).fill(C.Empty)) as Board
      };
      localGame.board[3][3] = localGame.board[4][4] = C.Player1;
      localGame.board[4][3] = localGame.board[3][4] = C.Player2;
      return this.gameDoc.set( LocalGameToFb(localGame) );
    }
  }

  private get turn(): Turn {
    return this.game.turn;
  }

  private set turn(v: Turn) {
    this.game.turn = v;
  }

  private get board(): Board {
    return this.game.board;
  }

  get turnGame(): Turn {
    return this.game.turn;
  }
}


