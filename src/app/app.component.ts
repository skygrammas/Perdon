import { Component } from '@angular/core';
import { GameBoard } from './models/gameboard';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'perdon-angular';
  game: GameBoard;
  constructor() {}

  changeListener(event) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      reader.onload = (e) => {
        this.game = new GameBoard(reader.result.toString());
      };
      reader.readAsText(file);
    }
  }

}
