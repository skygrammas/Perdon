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
      this.game.addNewPlayer('blue', 'Player 2');
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
    this.renderBoard();
  }

  playerDrawTransitionCards() {
    const stepsCount = parseInt(this.stepCard.step, 10);
    for (let i = 0; i < stepsCount; i++) {
      this.transitionCards.push(this.game.drawTransitionCard());
    }
    this.renderBoard();
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
        const epsilonMove = prompt('Enter desired position number (values: 1-3; enter 0 to stay in same position): ');
        if (+epsilonMove !== 0) {
          player.pieceLocation = player.pieceLocation.possibleTransitions[+epsilonMove - 1];
          this.transitionCards = this.transitionCards.filter(item => item !== card);
        } else {
          this.transitionCards = [];
        }
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
      this.transitionCards = [];
      this.stepCard = null;
      this.game.players = [];
      this.game = null;
      alert(this.game.currentPlayer() + ' has won the game!');
      return;
    } else {
      this.game.nextPlayer();
      this.currentPlayer = this.game.currentPlayer().name;
      this.stepCard = null;
      this.transitionCards = [];
      this.transitionCardsActive = false;
    }
    this.renderBoard();
  }

  renderBoard() {
    console.log(this.stepCard, this.transitionCards);
    this.canvasBoard.renderBoard(this.game.players, this.game.currentPlayer(), this.stepCard, this.transitionCards);
  }

  handleCanvasClicks(event: MouseEvent) {
    const clickX = event.x;
    const clickY = event.y;
    const transitionDeck = this.canvasBoard.deckCoords.transitionDeck;
    const stepDeck = this.canvasBoard.deckCoords.stepDeck;
    const cardSize = this.canvasBoard.deckCoords.cardSize;
    if (this.clickWithinRect(stepDeck.x, stepDeck.y, cardSize.width, cardSize.height, clickX, clickY)) {
      if (this.stepCard == null) {
        this.playerDrawStepCard();
      }
    }
    if (this.clickWithinRect(transitionDeck.x, transitionDeck.y, cardSize.width, cardSize.height, clickX, clickY)) {
      if (this.transitionCards.length === 0) {
        this.playerDrawTransitionCards();
      }
    }
  }

  private clickWithinRect(x: number, y: number, width: number, height: number, clickX: number, clickY: number): boolean {
    const left = x;
    const top = y;
    const right = x + width;
    const bot = y + height;
    return clickX >= left && clickX <= right && clickY >= top && clickY <= bot;
  }
}

export class Ellipse {
  public x = 0;
  public y = 0;
  public radius = 10;
  public line_width = 2;
  public color = 'red';
  public displayNumber;

  constructor(x: number, y: number, color: string = 'red', displayNumber: number, radius: number = 50, line_width: number = 2) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.line_width = line_width;
    this.displayNumber = displayNumber;
  }

  public draw = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.line_width;
    ctx.ellipse(this.x, this.y, this.radius, this.radius * 0.6, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();

    if (this.displayNumber !== 0) {
      ctx.font = '32px serif';
      ctx.strokeText(this.displayNumber.toString(), this.x, this.y);
    }
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

  public readonly deckCoords = {
    cardSize: {
      width: 150,
      height: 200
    },
    transitionDeck: {
      x: 800,
      y: 150
    },
    stepDeck: {
      x: 600,
      y: 150
    }
  };

  constructor (states: State[]) {
    this.context = canvas.getContext('2d');
    this.states = states;
  }

  renderBoard(players: Player[], currPlayer: Player, stepCard: StepCard, transitionCards: TransitionCard[]) {

    const playersPos: State[] = [];
    for (let i in players) {
      playersPos.push(players[i].pieceLocation);
    }

    this.context.clearRect(0, 0, 1280, 720);
    this.context.fillStyle = 'grey';
    this.context.fillRect(0, 0, 1280, 720);

    for (let i = 0; i < this.states.length; i++) {
      const x = this.states[i].xCoord * 130 + 100;
      const y = this.states[i].yCoord * 100 + 72;
      // If the state falls in the transition state of current players make the color red
      let color;
      let transition = 0;
      if (playersPos.includes(this.states[i])) {
        let x_pad  = Math.random() * 5;
        let y_pad = Math.random() * 5;
        const playerFound: Player = players[playersPos.indexOf(this.states[i])];
        draw_player(this.context, playerFound.color, (x + x_pad), (y + y_pad));
        color = 'blue';
        x_pad = y_pad = 0;
      } else if (currPlayer.pieceLocation.possibleTransitions.includes(this.states[i])) {
         // find which states transitions to this state
         transition = currPlayer.pieceLocation.possibleTransitions.indexOf(this.states[i]) + 1;
         color = 'red';
      } else {
         color = 'green';
      }

      const a_ellipse = new Ellipse(x, y, color, transition);
      a_ellipse.draw(this.context);
    }
    this.renderCardDeck('Step Card', this.deckCoords.stepDeck.x, this.deckCoords.stepDeck.y, '#81B7FF', 'blue');
    this.renderCardDeck('Transition Card', this.deckCoords.transitionDeck.x, this.deckCoords.transitionDeck.y, '#81B7FF', 'red');

    console.log('step cards', stepCard);
    if (stepCard) {
      this.renderDrawnStepCard(stepCard, 600, 400);
    }

    console.log('transition cards', transitionCards);
    if (transitionCards.length !== 0) {
      this.renderDrawnTransitionCard(transitionCards, 800, 400);
    }
  }

  renderCardDeck(deckName: string, xOffset: number, yOffset: number, cardBorderColor: string, cardColor: string) {
    const width = this.deckCoords.cardSize.width;
    const height = this.deckCoords.cardSize.height;

    this.context.beginPath();
    this.context.lineWidth = 2;
    this.context.strokeStyle = cardBorderColor;
    this.context.fillStyle = cardColor;
    this.context.fillRect(xOffset + 5, yOffset + 5, width, height);
    this.context.rect(xOffset + 5, yOffset + 5, width, height);
    this.context.stroke();

    this.context.beginPath();
    this.context.lineWidth = 2;
    this.context.strokeStyle = cardBorderColor;
    this.context.fillStyle = cardColor;
    this.context.fillRect(xOffset + 10, yOffset + 7, width, height);
    this.context.rect(xOffset + 10, yOffset + 7, width, height);
    this.context.stroke();

    this.context.beginPath();
    this.context.lineWidth = 2;
    this.context.strokeStyle = cardBorderColor;
    this.context.fillStyle = cardColor;
    this.context.fillRect(xOffset + 15, yOffset + 9, width, height);
    this.context.rect(xOffset + 15, yOffset + 9, width, height);
    this.context.stroke();

    this.context.beginPath();
    this.context.lineWidth = 2;
    this.context.strokeStyle = 'white';
    this.context.font = '30px Sans';
    this.context.strokeText(deckName, xOffset + 40, yOffset + 110, 100);
    this.context.stroke();
  }

  renderDrawnStepCard(card: StepCard, startX: number, startY: number) {
    this.context.beginPath();
    this.context.lineWidth = 2;
    this.context.fillStyle = 'blue';
    this.context.fillRect(startX, startY, 150, 200);
    this.context.font = '30px Sans';
    this.context.strokeText(card.step, startX + 40, startY + 110);
    this.context.stroke();
  }

  renderDrawnTransitionCard(cards: TransitionCard[], startX: number, startY: number) {
    let currX = startX;
    cards.forEach(card => {
      this.context.beginPath();
      this.context.lineWidth = 2;
      this.context.fillStyle = 'red';
      this.context.fillRect(currX, startY, 100, 150);
      this.context.font = '30px Sans';
      this.context.strokeText(card.transition, currX + 5, startY + 110);
      currX += 130;
    });
  }
}

window.onload = function() {
  canvas = <HTMLCanvasElement>document.getElementById('gameCanvas');
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
};

