export default class SymbolTable {
    private nextAvailableAddress: number;
    private symbolsMap: { [key: string]: number };

    public constructor() {
        this.nextAvailableAddress = 16;
    }

    public resolveSymbol(symbolKey: string): number {
        let address: number;

        if (typeof this.symbolsMap[symbolKey] !== "number") {
            address = this.addEntry(symbolKey);
        } else {
            address = this.symbolsMap[symbolKey];
        }

        return address;
    }

    private addEntry(symbolKey: string): number {
        const address: number = this.nextAvailableAddress;
        this.symbolsMap[symbolKey] = address;

        this.nextAvailableAddress += 1;
        return address;
    }

    private setInitialMap = () => {
        this.symbolsMap = {
            SP: 0,
            LCL: 1,
            ARG: 2,
            THIS: 3,
            THAT: 4,
            R0: 0,
            R1: 1,
            R2: 2,
            R3: 3,
            R4: 4,
            R5: 5,
            R6: 6,
            R7: 7,
            R8: 8,
            R9: 9,
            R10: 10,
            R11: 11,
            R12: 12,
            R13: 13,
            R14: 14,
            R15: 15,
            SCREEN: 16384,
            KBD: 24576,
        };
    };
}
