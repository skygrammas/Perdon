import { State } from './states';

export class Player {
    name: string;
    pieceLocation: State;
    color: string;
    constructor(name: string, startState: State, color: string) {
        this.name = name;
        this.pieceLocation = startState;
        this.color = color;
    }
}
