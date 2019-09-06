import { Component } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth, User} from 'firebase/app';
import {Board, C, FbGame, FbGameToLocal, LocalGame, LocalGameToFb} from './ReversiDefinitions';
import {Observable} from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'L3M-TP4v4';
  user: User;
  readonly gamesObs: Observable<LocalGameAndDocId[]>;

  constructor(public afAuth: AngularFireAuth, private db: AngularFirestore) {
    this.afAuth.user.subscribe(user => this.user = user);
    const parties = db.collection<FbGame>('/partie');
    this.gamesObs = parties.valueChanges({idField: 'docId'}).pipe(
      map((LFBG: FbGameAndDocId[]) => LFBG.map(g => ({...FbGameToLocal(g), docId: g.docId})))
    );
  }
  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }
  logout() {
    this.afAuth.auth.signOut();
  }

  async createBoard(name: string) {
    try {
      const gameDoc = this.db.doc<FbGame>(`/partie/${name}`);
      const player1 = {
        displayName: this.user.displayName,
        phoneNumber: null,
        email: '',
        uid: this.user.uid,
        providerId: '1',
        photoURL: 'http://www.bobthebuilder.com/fr-fr/Images/btb_where_to_watch_background_Bob_tcm1281-232957.png'
      };
      const localGame: LocalGame = {
        player1,
        player2: null,
        turn: C.Player1,
        board: new Array(8).fill(0).map(l => new Array(8).fill(C.Empty)) as Board
      };
      localGame.board[3][3] = localGame.board[4][4] = C.Player1;
      localGame.board[4][3] = localGame.board[3][4] = C.Player2;
      gameDoc.set( LocalGameToFb(localGame) );
    } catch (e) {
      console.log(e.message);
    }
  }
}

type FbGameAndDocId = FbGame & {docId: string};
type LocalGameAndDocId = LocalGame & {docId: string};
