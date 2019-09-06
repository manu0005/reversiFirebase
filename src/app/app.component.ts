import { Component } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import { auth } from 'firebase/app';
import {FbGame, FbGameToLocal, LocalGame} from './ReversiDefinitions';
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
  readonly gamesObs: Observable<LocalGameAndDocId[]>;

  constructor(public afAuth: AngularFireAuth, private db: AngularFirestore) {
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
}

type FbGameAndDocId = FbGame & {docId: string};
type LocalGameAndDocId = LocalGame & {docId: string};
