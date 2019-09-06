import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ReversiService} from '../reversi.service';
import {C, LocalGame, Turn} from '../ReversiDefinitions';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ReversiService]
})
export class BoardComponent implements OnInit {
  @Input() docId: string;

  constructor(private RS: ReversiService) {
  }

  ngOnInit() {
    this.RS.initGame(this.docId);
  }

  get gameObs(): Observable<LocalGame> {
    return this.RS.gameObs;
  }
  canPlay(i: number, j: number): boolean {
    return this.RS.tilesGainedIfPlayAt(i, j).length > 0;
  }

  isEmpty(c: C) {
    return c === C.Empty;
  }

  isP1(c: C) {
    return c === C.Player1;
  }
  isP2(c: C) {
    return c === C.Player2;
  }

  play(i: number, j: number) {
    this.RS.play(i, j);
  }

  changeGame(name: string) {
    if (name) {
      this.RS.idGame = name;
    }
  }

  get turnGame(): Turn {
    return this.RS.turnGame;
  }
}
