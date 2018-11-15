import { Component } from '@angular/core';
import { GameBoard } from './models/gameboard';
import { TransitionCard, StepCard } from './models/cards';
import { State } from './models/states';
import { Player } from './models/players';

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
  stepCard: StepCard;
  transitionCards: TransitionCard[] = [];
  gameEnded = false;
  transitionCardsActive = false;
  private canvasBoard: CanvasBoard;
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
      // this.game.addNewPlayer('blue', 'Player 2');
      this.currentPlayer = this.game.currentPlayer().name;
      this.canvasBoard = new CanvasBoard(this.game.states);
      this.renderBoard();
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
    const stepCard = this.game.drawStepCard();
    this.stepCard = stepCard;
    this.transitionCards = [];
    if ( parseInt(stepCard.step, 10) > 0 ) {
      this.transitionCardsActive = true;
    }
  }

  playerDrawTransitionCards() {
    const stepsCount = parseInt(this.stepCard.step, 10);
    for (let i = 0; i < stepsCount; i++) {
      this.transitionCards.push(this.game.drawTransitionCard());
    }
  }

  useTransitionCard(card: TransitionCard) {
    const player = this.game.currentPlayer();
    // handle special transitions
    if (card.transition === '1' || card.transition === '2' || card.transition === '3') {
      const number = parseInt(card.transition, 10);
      if (player.pieceLocation.possibleTransitions.length >= number - 1 ) {
        player.pieceLocation = player.pieceLocation.possibleTransitions[number - 1];
        this.transitionCards = this.transitionCards.filter(item => item !== card);
        this.renderBoard();
      } else {
        console.log('impossible move');
      }
    } else {
      if (card.transition === 'epsilon') {
        console.log('Epsilon');
        // need to make user choose any state
      }
      if (card.transition === 'stop') {
        this.transitionCards = [];
      }
      if (card.transition === 'Perdon') {
        player.pieceLocation = this.game.start;
        this.transitionCards = this.transitionCards.filter(item => item !== card);
      }
    }
    if (this.transitionCards.length === 0) {
      this.transitionCardsActive = false;
    }
    this.renderBoard();
  }

  endTurn() {
    this.gameEnded = this.game.currentPlayer().pieceLocation.typeOfState === 'End';
    if (this.gameEnded) {
      return;
    }
    this.game.nextPlayer();
    this.currentPlayer = this.game.currentPlayer().name;
    this.stepCard = null;
    this.transitionCards = [];
    this.transitionCardsActive = false;
  }

  renderBoard() {
    this.canvasBoard.renderBoard(this.game.currentPlayer().pieceLocation, this.game.currentPlayer().color);
    // this.canvasBoard.renderStateBoard(this.game.getPlayers());
  }
}

export class Ellipse {
  public x = 0;
  public y = 0;
  public radius = 10;
  public line_width = 2;
  public color = 'red';

  constructor(x: number, y: number, color: string = 'red', radius: number = 50, line_width: number = 2) {
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
    ctx.ellipse(this.x, this.y, this.radius, this.radius * 0.6, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
}

function draw_player(context: CanvasRenderingContext2D, color: string, x: number, y: number) {
  context.beginPath();
  context.fillStyle = color;
  context.moveTo(x, y);
  context.lineTo(x + 20, y + 20);
  context.lineTo(x - 20, y + 20);
  context.lineTo(x, y);
  context.fillStyle = color;
  context.fill();
  context.stroke();
}

export class CanvasBoard {
  private readonly context: CanvasRenderingContext2D;
  private readonly states: State[];

  constructor (states: State[]) {
    this.context = canvas.getContext('2d');
    this.states = states;
  }

  renderBoard(pieceLocation: State, pieceColor: string) {
    this.context.clearRect(0, 0, 1280, 720);
    this.context.fillStyle = 'grey';
    this.context.fillRect(0, 0, 1280, 720);

    for (let i = 0; i < this.states.length; i++) {
      const x = this.states[i].xCoord * 130 + 100;
      const y = this.states[i].yCoord * 100 + 72;

      // If the state falls in the transition state of current players make the color red
      let color;
      if (pieceLocation === this.states[i]) {
        const x_pad  = Math.random() * 5;
        const y_pad = Math.random() * 5;
        draw_player(this.context, pieceColor, x + x_pad, y + y_pad);
        color = 'blue';
      } else if (pieceLocation.possibleTransitions.includes(this.states[i])) {
        console.log('player found');
         color = 'red';
      } else {
         color = 'green';
      }

      const a_ellipse = new Ellipse(x, y, color);
      a_ellipse.draw(this.context);
    }

  }
  // renderStateBoard( players: Player[]) {
  //   pieceLocations = [] // Get the piece location ehre
  //   pieceColors = [] // Get the corrosponding piece color here

  //   this.context.clearRect(0, 0, 1280, 720);
  //   this.context.fillStyle = 'grey';
  //   this.context.fillRect(0, 0, 1280, 720);

  //   for (let i = 0; i < this.states.length; i++) {
  //     const x = this.states[i].xCoord * 130 + 100;
  //     const y = this.states[i].yCoord * 100 + 72;

  //     // If the state falls in the transition state of current players make the color red
  //     let color;
  //     if (pieceLocation === this.states[i] ) { // Check if this.states[i] is in pieceLocations
  //       const x_pad  = Math.random() * 5;
  //       const y_pad = Math.random() * 5;
  //       draw_player(this.context, pieceColor, x + x_pad, y + y_pad);
  //       color = 'blue';
  //     } else if (pieceLocation.possibleTransitions.includes(this.states[i])) {
  //       console.log('player found');
  //        color = 'red';
  //     } else {
  //        color = 'green';
  //     }

  //     const a_ellipse = new Ellipse(x, y, color);
  //     a_ellipse.draw(this.context);
  //   }

  // }
}


window.onload = function() {
  canvas = <HTMLCanvasElement>document.getElementById('gameCanvas');
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
};

