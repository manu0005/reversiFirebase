import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {C} from "../ReversiDefinitions";

@Component({
  selector: 'app-pion',
  templateUrl: './pion.component.html',
  styleUrls: ['./pion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PionComponent implements OnInit {

  @Input() player:C;
  constructor() { }

  ngOnInit() {
  }
  isP1(){
    return this.player===C.Player1;
  }
  isP2(){
    return this.player===C.Player2;
  }
}
