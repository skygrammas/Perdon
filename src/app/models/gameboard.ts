import { StepCard, TransitionCard} from './cards';
import { State } from './states';
import { Player } from './players';

export class GameBoard {
    private stepCards: StepCard[];
    private transitionCard: TransitionCard[];
    start: State;
    end: State;
    challenge: State;
    states: State[];
    players: Player[];

    constructor() {
        this.players = [];
        this.stepCards = [];
        this.transitionCard = [];
    }

    public static generateGame(cardFileData: string, stateFileData: string): GameBoard {
        const game = new GameBoard();
        GameBoard.generateCards(game, cardFileData);
        GameBoard.generateStates(stateFileData, game);
        game.shuffleCards();
        return game;
    }


    private static generateCards(game: GameBoard, cardFileData: string) {
        // console.log('Loading Cards...');
        const lines = cardFileData.split('\n');
        lines.forEach(line => {
            const component = line.split('|');
            if (component[0] === 'step') {
                const amountOfCards: number = parseInt(component[2], 10);
                for (let i = 0; i < amountOfCards; i++) {
                    game.stepCards.push(new StepCard(component[1]));
                }
            } else if (component[0] === 'transition') {
                const amountOfCards: number = parseInt(component[2], 10);
                for (let i = 0; i < amountOfCards; i++) {
                    game.transitionCard.push(new TransitionCard(component[1]));
                }
            } else {
                console.log('unexpected card type');
            }
        });
    }

    private static generateStates(stateFileData: string, game: GameBoard) {
        // console.log('Reading States..');
        const lines = stateFileData.split('\n');
        const tempStates: State[] = [];
        const transitions: {key: string,  trans: string[]}[] = [];
        lines.forEach(line => {
            const component = line.split('|');
            const coord = component[2].split(' ');
            const trans = component[1].split(' ').filter(s => s !== '-1');
            transitions.push({key: component[0], trans: trans });
            const state = new State(component[0], component[3], parseInt(coord[0], 10),  parseInt(coord[1], 10));
            tempStates.push(state);
        });
        transitions.forEach((element, i) => {
            const stateTransitions: State[] = [];
            element.trans.forEach(item => {
                for (let j = 0; j < tempStates.length; j++) {
                    if (item === tempStates[j].name) {
                        stateTransitions.push(tempStates[j]);
                    }
                }
            });
            tempStates[i].possibleTransitions = stateTransitions;
            game.states = tempStates;
            if (tempStates[i].typeOfState === 'Start') {
                game.start = tempStates[i];
            } else if (tempStates[i].typeOfState === 'Challenge') {
                game.challenge = tempStates[i];
            } else if (tempStates[i].typeOfState === 'End') {
                game.end = tempStates[i];
            }
        });
    }
    // https://stackoverflow.com/a/12646864
    private static shuffleArray<T>(array: T[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    private shuffleCards() {
        GameBoard.shuffleArray(this.stepCards);
        GameBoard.shuffleArray(this.transitionCard);
    }

    public drawStepCard(): StepCard {
       const card = this.stepCards.shift();
       this.stepCards.push(card);
       return card;
    }

    public drawTransitionCard(): TransitionCard {
        const card = this.transitionCard.shift();
        this.transitionCard.push(card);
        return card;
    }

    public nextPlayer() {
        const player = this.players.shift();
        this.players.push(player);
    }

    public currentPlayer() {
        return this.players[0];
    }

    public addNewPlayer(color: string, name: string) {
        this.players.push(new Player(name, this.start, color));
    }

    public getPlayers(): Player[] {
        return this.players;
    }

}
