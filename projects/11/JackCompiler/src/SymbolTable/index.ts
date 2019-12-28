import Symbol from "../../types/Symbol";
import JackTokenizer from "../JackTokenizer";
import CurrentToken from "../../out/types/CurrentToken";
import VMCommand from "../../types/VMCommand";

const symbols: string[] = [
    Symbol.CurlyRight,
    Symbol.CurlyLeft,
    Symbol.ParenRight,
    Symbol.ParenLeft,
    Symbol.BracketRight,
    Symbol.BracketLeft,
    Symbol.Period,
    Symbol.Comma,
    Symbol.Semi,
    Symbol.Plus,
    Symbol.Minus,
    Symbol.Times,
    Symbol.SlashRight,
    Symbol.Ampersand,
    Symbol.Pipe,
    Symbol.LessThan,
    Symbol.GreaterThan,
    Symbol.Equals,
    Symbol.Not,
];

const amp = "&";
const lt = "<";
const gt = ">";

export default class SymbolTable {
    static get(char: string): string {
        let i: number;

        if (char === amp) {
            return Symbol.Ampersand;
        }

        if (char === lt) {
            return Symbol.LessThan;
        }

        if (char === gt) {
            return Symbol.GreaterThan;
        }

        for (i = 0; i < symbols.length; i++) {
            if (symbols[i] === char) {
                return symbols[i];
            }
        }

        throw new Error("Failed to identify symbol");
    }

    static includes(char: string): boolean {
        return symbols.includes(char);
    }

    static isSemi(char: string): boolean {
        return char === Symbol.Semi;
    }

    // Minus is the only Symbol that can be either 'Op' or 'UnaryOp'
    static isOp(jackTokenizer: JackTokenizer): boolean {
        const tokenState: CurrentToken = jackTokenizer.getCurrentTokenState();
        const currentToken: string = tokenState.value;

        const ops: string[] = [
            Symbol.Plus,
            Symbol.Minus,
            Symbol.Times,
            Symbol.SlashRight,
            amp,
            Symbol.Pipe,
            gt,
            lt,
            Symbol.Equals,
        ];

        const isOp = ops.includes(currentToken);

        if (!isOp) return false;

        if (isOp && currentToken !== Symbol.Minus) return true;

        // Otherwise isOp is true but it is Symbol.Minus
        // Make sure the Minus is not actually a UnaryOp

        const pointer: number = jackTokenizer.getPointer();
        const lastPointer: number = pointer - 1;

        if (isOp && jackTokenizer.isValidPointerValue(lastPointer)) {
            // if the 'beforeToken' is a "Symbol" then this must be a "UnaryOp"
            const beforeToken = jackTokenizer.getTokenAtPointer(lastPointer);
            // If the 'beforeToken' is a "Symbol" then this is NOT an "Op". It is a "UnaryOp"

            // Update this to if beforeToken != Parenright then, true this is an Op
            // If the beforeToken is ParenLeft however at this point then this is a negate
            // Unary Op and NOT an OP
            return beforeToken !== Symbol.ParenRight;
        }

        // Fallback is to just confirm this is indeed an 'Op' token
        return isOp;
    }

    static isUnaryOp(char: string): boolean {
        const unaries: string[] = [Symbol.Not, Symbol.Minus];
        return unaries.includes(char);
    }

    static getVMOperation(char: string): VMCommand {
        switch (char) {
            case "+":
                return VMCommand.Add;
            case amp:
                return VMCommand.And;
            case "=":
                return VMCommand.Eq;
            case lt:
                return VMCommand.Lt;
            case gt:
                return VMCommand.Gt;
            case "|":
                return VMCommand.Or;
            case "-":
                return VMCommand.Sub;
            default:
                throw new Error("Failed to identify operation");
        }
    }

    static getVMUnaryOp(char: string): VMCommand {
        switch (char) {
            case "~":
                return VMCommand.Not;
            case "-":
                return VMCommand.Neg;
            default:
                throw new Error("Failed to identify unary operation");
        }
    }
}
