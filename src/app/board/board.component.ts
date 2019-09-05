import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ReversiService} from '../reversi.service';
import {C} from '../ReversiDefinitions';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent implements OnInit {

  constructor(private RS: ReversiService) {

  }

  ngOnInit() {
  }

  getBoard() {
    return this.RS.getBoard();
  }

  getObs() {
    return this.RS.getObservable();
  }

  canPlay(i: number, j: number): boolean {
    return this.RS.canPlay(i, j).length > 0;
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
}
