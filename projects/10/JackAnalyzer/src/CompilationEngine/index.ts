import JackTokenizer from "../JackTokenizer";
import KeywordTable from "../KeywordTable";
import TokenType from "../../types/TokenType";
import Symbol from "../../types/Symbol";

/**
 * Effects the actual complation output. Gets its input from a JackTokenizer and emits its parsed
 * structure into an output stream. Every syntactic element of the Jack language has a cooresponding
 * 'compile routine.'
 *
 * The contract between these routines is that each 'compile routine' should read the syntactic
 * construct 'abc' from the input, advance() thetokenizer exactly beyond 'abc', and output the
 * parsing of 'abc'.
 *
 * The first routine called must be 'compileClass'
 */

export default class CompilationEngine {
    private tokenizer: JackTokenizer;

    constructor(tokenizer: JackTokenizer) {
        this.tokenizer = tokenizer;
    }

    public compile(): void {
        let xml: string;
        let currentToken: string;

        try {
            currentToken = this.tokenizer.getCurrentToken();

            if (KeywordTable.isClass(currentToken)) {
                xml = this.compileClass();
                console.log("Write XML", xml);
            } else {
                throw new Error("Program must begin with a class declaration");
            }
        } catch (error) {
            throw error;
        }
    }

    /** Compiles a complete class */
    public compileClass(xml = ""): string {
        const currentToken: string = this.tokenizer.getCurrentToken();
        const tokenType: TokenType = this.tokenizer.getTokenType();

        const isSymbol: boolean = tokenType === TokenType.Symbol;
        const isKeyword: boolean = tokenType === TokenType.Keyword;

        if (isSymbol && currentToken === Symbol.CurlyLeft) {
            return xml.concat(this.getSymbol());
        }

        if (isKeyword && KeywordTable.isClassVarDec(currentToken)) {
            xml = this.compileClassVarDec();
        }

        if (this.tokenizer.hasMoreTokens()) {
            this.tokenizer.advance();
        }
        return this.compileClass(xml);
    }

    /** Compiles a static declaration or a field declaration.
     * (static | field) type varName (, varName)*
     * */
    private compileClassVarDec(): string {}

    private compileSubroutne(): string {}

    /** Compile a possibly empty parameter list */
    private compileParameterList(): string {}

    private getSymbol(): string {
        return `<symbol> ${this.tokenizer.getSymbol()} </symbol>`;
    }
}
