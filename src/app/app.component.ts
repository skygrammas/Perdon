import { Component } from '@angular/core';
import { GameBoard } from './models/gameboard';
import { State } from './models/states';

let canvas: HTMLCanvasElement;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'perdon-angular';
  game: GameBoard;

  currentPlayer = 'No player';

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
      this.game.addNewPlayer('green', 'Player 1');
      this.game.addNewPlayer('blue', 'Player 2');
      this.currentPlayer = this.game.currentPlayer().name;
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

  playerDrawStepCard() {
    const currentPlayer = this.game.currentPlayer();
    const stepCard = this.game.drawStepCard();
    //render the card in the UI
    console.log(stepCard.step);
  }

  renderBoard() {

  }

}

export class Circle {
  public x = 0;
  public y = 0;
  public radius = 10;
  public line_width = 2;
  public color = 'red';

  constructor(x: number, y: number, radius: number, color: string = 'red', line_width: number = 2) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.line_width = line_width;
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.line_width;
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
}

export class CanvasBoard {
  private readonly context: CanvasRenderingContext2D;

  constructor() {
    this.context = canvas.getContext('2d');
  }

  renderBoard(radius: number) {
    this.context.clearRect(0, 0, 1280, 720);
    this.context.fillStyle = 'grey';
    this.context.fillRect(0, 0, 1280, 720);

    const myCircle: Circle = new Circle(50, 75, radius, 'white', 2);
    myCircle.draw(this.context);
  }
}


window.onload = function() {
  canvas = <HTMLCanvasElement>document.getElementById('gameCanvas');
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  const board = new CanvasBoard();
  board.renderBoard(100);
  board.renderBoard(100);
};

