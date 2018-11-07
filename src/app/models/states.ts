export class State {
    possibleTransitions: State[];
    name: string;
    xCoord: number;
    yCoord: number;
    typeOfState: string;

    constructor(name: string, typeofState: string, x: number, y: number ) {
        this.name = name;
        this.typeOfState = typeofState;
        this.xCoord = x;
        this.yCoord = y;
    }
}
