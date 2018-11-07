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

  async changeListener(event) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length === 2) {
      const files = event.target.files as File[];
      let cardsFileContents: any;
      let statesFileContents: any;
      if (files[0].name === 'cards.txt') {
        await this.readUploadedFileAsText(files[0]).then(data => {
          cardsFileContents = data;
        });
        await this.readUploadedFileAsText(files[1]).then(data => {
          statesFileContents =  data;
        });
      } else {
        await this.readUploadedFileAsText(files[1]).then(data => {
          cardsFileContents = data;
        });
        await this.readUploadedFileAsText(files[0]).then(data => {
          statesFileContents =  data;
        });
      }
      this.game = GameBoard.generateGame(cardsFileContents, statesFileContents);
    } else {
      console.error('Too many files or no files were read.');
    }
  }

  async readUploadedFileAsText(inputFile): Promise<string> {
    const temporaryFileReader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(new DOMException('Problem parsing input file.'));
      };
      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result.toString());
      };
      temporaryFileReader.readAsText(inputFile);
    });
  }

}
