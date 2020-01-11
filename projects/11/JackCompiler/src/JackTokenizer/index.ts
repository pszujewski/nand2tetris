import CurrentToken from "../../types/CurrentToken";
import TokenType from "../../types/TokenType";
import KeywordTable from "../KeywordTable";
import SymbolTable from "../SymbolTable";

/** Removes all comments and whitespace from the input stream and breaks it into Jack-language tokens */
export default class JackTokenizer {
    private syntacticElements: string[];
    private pointer: number;
    private currentToken: string;
    private lookAheadToken: string;

    public constructor(syntacticElements: string[]) {
        this.syntacticElements = syntacticElements;
        this.pointer = 0;
        this.currentToken = "";
        this.lookAheadToken = "";
    }

    public isFirstTokenClassKeyword(): boolean {
        return KeywordTable.isClass(this.syntacticElements[0]);
    }

    /** Returns true if we have more tokens in the input */
    public hasMoreTokens(): boolean {
        return this.pointer + 1 < this.syntacticElements.length;
    }

    /** Gets the next token from the input and makes it the current token. */
    public advance(): void {
        if (!this.currentToken) {
            this.currentToken = this.syntacticElements[this.pointer];
        } else {
            this.pointer = this.pointer + 1;
            this.currentToken = this.syntacticElements[this.pointer];
        }
        this.advanceLookAhead();
    }

    public getTokenAt(idx: number): string {
        const token = this.syntacticElements[idx];
        if (token) {
            return token;
        }
        return "";
    }

    private advanceLookAhead(): void {
        const lookAheadPointer = this.pointer + 1;

        if (this.syntacticElements[lookAheadPointer]) {
            this.lookAheadToken = this.syntacticElements[lookAheadPointer];
        }
    }

    /** Does not set the currentToken, but returns what the next current token will be
     * after next call to advance()
     */
    public lookAhead(): string {
        const lookAheadPointer: number = this.pointer + 1;
        return this.syntacticElements[lookAheadPointer];
    }

    /** Returns the type of the current token */
    public getTokenType(): TokenType {
        const token: string = this.currentToken;

        if (KeywordTable.includes(token)) {
            return TokenType.Keyword;
        }

        if (SymbolTable.includes(token)) {
            return TokenType.Symbol;
        }

        if (token.indexOf("stringConstant=") > -1) {
            return TokenType.StringConst;
        }

        if (!isNaN(parseInt(token))) {
            return TokenType.IntConst;
        }

        return TokenType.Identifier;
    }

    public getCurrentToken(): string {
        return this.currentToken;
    }

    public getPointer(): number {
        return this.pointer;
    }

    public getCurrentTokenState(): CurrentToken {
        const value: string = this.getCurrentToken();
        const type: string = this.getTokenType();

        return {
            value,
            type,
            isSymbol: type === TokenType.Symbol,
            isKeyword: type === TokenType.Keyword,
            isIntConst: type === TokenType.IntConst,
            isStringConst: type === TokenType.StringConst,
            isIdentifier: type === TokenType.Identifier,
        };
    }

    public getTokenAtPointer(pointerValue: number): string {
        if (this.syntacticElements[pointerValue]) {
            return this.syntacticElements[pointerValue];
        }
        return "";
    }

    public isValidPointerValue(value: number): boolean {
        const len = this.syntacticElements.length;
        return value > -1 && value < len;
    }

    /** Returns the keyword which is the current token */
    public getKeyword(): string {
        return KeywordTable.get(this.currentToken);
    }

    /** Returns the symbol character which is the current token.
     * Should only be called when tokenType is Symbol
     */
    public getSymbol(): string {
        return SymbolTable.get(this.currentToken);
    }

    /** Returns the identifier which is the current token.
     * Only called when tokenType is Identifier. For example in 'class Fraction'
     * 'Fraction' is the 'identifier' that would be returned
     * */
    public getIdentifier(): string {
        return this.currentToken.trim();
    }

    /** Returns the integer value of the current token.
     * Should be called only when tokenType is Int_Const
     * */
    public getIntVal(): number {
        return parseInt(this.currentToken);
    }

    /** Return the string value of the current token without the double quotes.
     * Only called when the tokenType is String_Const */
    public getStringVal(): string {
        const token: string = this.currentToken;
        const toReplace = "stringConstant=";
        return token.replace(toReplace, "");
    }
}
