import Symbol from "../../types/Symbol";
import Keyword from "../../types/Keyword";
import TokenType from "../../types/TokenType";

/** Removes all comments and whitespace from the input stream and breaks it into Jack-language tokens */
export default class JackTokenizer {
    private inputTokens: string[];
    private pointer: number;
    private currentToken: string;

    public constructor(inputTokens: string[]) {
        this.inputTokens = inputTokens;
        this.pointer = 0;
        this.currentToken = inputTokens[0];
    }

    /** Returns true if we have more tokens in the input */
    public hasMoreTokens(): boolean {
        return false;
    }

    /** Gets the next token from the input and makes it the current token. */
    public advance(): void {}

    /** Returns the type of the current token */
    private getTokenType(): TokenType {
        return TokenType.Identifier;
    }

    /** Returns the keyword which is the current token */
    private getKeyword(): Keyword {
        return Keyword.Boolean;
    }

    /** Returns the symbol character which is the current token.
     * Should only be called when tokenType os Symbol
     */
    private getSymbol(): Symbol {
        return Symbol.Ampersand;
    }

    /** Returns the identifier which is the current token.
     * Only called when tokenType is Identifier. For example in 'class Fraction'
     * 'Fraction' is the 'identifier' that would be returned
     * */
    private getIdentifier(): string {
        return "";
    }

    /** Returns the integer value of the current token.
     * Should be called only when tokenType is Int_Const
     * */
    private getIntVal(): number {
        return 0;
    }

    /** Return the string value of the current token without the double quotes.
     * Only called when the tokenType is String_Const */
    private getStringVal(): string {
        return "";
    }
}
