import { StepCard, TransitionCard} from './cards';
import { State } from './states';
import { Player } from './players';

export class GameBoard {
    stepCards: StepCard[] = [];
    transitionCard: TransitionCard[] = [];
    start: State;
    end: State;
    challenge: State;
    players: Player[];

    constructor(cardFileData: string) {
        GameBoard.generateCards(this.stepCards, this.transitionCard, cardFileData);
        GameBoard.generateStates();
        console.log(this.stepCards.length);
        console.log(this.transitionCard.length);
    }


    private static generateCards(stepCards: StepCard[], transitionCards: TransitionCard[], cardFileData: string) {
        console.log('Loading Cards...');
        const lines = cardFileData.toString().split('\n');
        lines.forEach(line => {
            const component = line.split('|');
            // console.log(component);
            if (component[0] === 'step') {
                const amountOfCards: number = parseInt(component[2]);
                for (let i = 0; i < amountOfCards; i++) {
                    stepCards.push(new StepCard(component[1]));
                }
            } else if (component[0] === 'transition') {
                const amountOfCards: number = parseInt(component[2]);
                for (let i = 0; i < amountOfCards; i++) {
                    transitionCards.push(new TransitionCard(component[1]));
                }
            } else {
                console.log('unexpected card type');
            }
        });
    }

    private static generateStates() {
        console.log('Reading States..');
    }


}
